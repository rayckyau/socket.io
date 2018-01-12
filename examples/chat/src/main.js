/*jshint esversion: 6 */
import io from 'socket.io-client';
import * as navi from './navi';
import * as env from './env';

  $(function () {
    const COLORS = [
      '#e21400', '#91580f', '#f8a700', '#f78b00',
      '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
      '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    // Initialize variables
    const $window = $(window);
    const $usernameInput = $('.usernameInput'); // Input for username
    const $roomInput = $('.roomInput'); // Input for room code

    const $loginPage = $('.login.page'); // The login page
    const $drawPage = $('.draw.page'); // The draw page

    // Prompt for setting a username
    var username;
    var room;
    let connected = false;
    let typing = false;
    var $currentInput = $usernameInput.focus();
    let socketReady = false;

    var drawsocket;
    var drawObj;

    let mainclientid;

    if (!('getContext' in document.createElement('canvas'))) {
      alert('Sorry, it looks like your browser does not support canvas!');
      return false;
    }

    //prevent pull to refresh
    var maybePreventPullToRefresh = false;
    var lastTouchY = 0;
    var touchstartHandler = function(e) {
        if (e.touches.length != 1) return;
        lastTouchY = e.touches[0].clientY;
        // Pull-to-refresh will only trigger if the scroll begins when the
        // document's Y offset is zero.
        maybePreventPullToRefresh =  window.pageYOffset == 0;
      }

    var touchmoveHandler = function(e) {
      var touchY = e.touches[0].clientY;
      var touchYDelta = touchY - lastTouchY;
      lastTouchY = touchY;

      if (maybePreventPullToRefresh) {
        // To suppress pull-to-refresh it is sufficient to preventDefault the
        // first overscrolling touchmove.
        maybePreventPullToRefresh = false;
        if (touchYDelta > 0) {
          e.preventDefault();
          return;
        }
        if (touchYDelta < 0) {
          e.preventDefault();
          return;
        }
      }
    }

    let doc = $(document),
      drawcanvas = $('#paper'),
      ctx = drawcanvas[0].getContext('2d')

    // Generate an unique ID
    let id = Math.round($.now() * Math.random());

    // A flag for drawing activity
    let drawing = false;
    let type = "INK";
    let points = [];
    let clients = {};
    let cursors = {};

    let prev = {};

    /////////stuff to do when page loads/////////////
    //TODO: this snippet below is to handle IE stuff, not working
    var passiveSupported = false;
    try {
      var options = Object.defineProperty({}, "passive", {
        get: function() {
          passiveSupported = true;
        }
      });

      document.addEventListener('touchstart', touchstartHandler, { passive: false });
      document.addEventListener('touchmove', touchmoveHandler, { passive: false });
    } catch(err) {}

    if (window.location.hash){
      autoRoomCodeFromUrl();
    }
    //check session
    //check session only if cookie is detected
    checkSession();
    //init canvas bindings
    setupDrawCanvasListeners();

    function autoRoomCodeFromUrl(){
      // substr(1) to remove the `#`
      var hashParams = window.location.hash.substr(1).split('&', 2);
      for(var i = 0; i < hashParams.length; i++){
          var p = hashParams[i].split('=');
          if (p[0] == "roomcodeInput"){
            document.getElementById("roomcodeInput").value = decodeURIComponent(p[1]);
          }
          else {
            console.log("Bad share hash detected.");
          }
      }
    }

    function checkSession(){
      let rp = require('request-promise');
      let url = 'http://' + window.location.hostname + ':' + env.PORT;
      console.log('request to : '+ url+'/checkSession');
      let options = {
          method: 'GET',
          uri: url+'/checkSession',
          body: {
              payload: 'hello'
          },
          json: true // Automatically stringifies the body to JSON
      };
      rp(options)
          .then(function (parsedBody) {
              console.log('session check: %s', parsedBody.views);

              //if session exists then go straight to checkroom code
              //set username and room code
              if (parsedBody.views){
                console.log('session username: %s', parsedBody.username);
                console.log('session room: %s', parsedBody.room);
                username = parsedBody.username;
                checkRoomCode(parsedBody.room, true);
                return true;
              }
              else {
                console.log("no session");
                return true;
              }

          })
          .catch(function (err) {
              console.log(err);
              return false;
          });
     }//end checkroom

   function checkRoomCode(roomcode, session=false){
     let rp = require('request-promise');
     let url = 'http://' + window.location.hostname + ':' + env.PORT;
     console.log('request to : '+ url+'/checkRoom/'+roomcode+'?username='+username)
     let options = {
         method: 'GET',
         uri: url+'/checkRoom/'+roomcode+'?username='+username,
         body: {
             room: roomcode
         },
         json: true // Automatically stringifies the body to JSON
     };
     rp(options)
         .then(function (parsedBody) {
             console.log('room check: %s', parsedBody);
             if (parsedBody){
               if (username){
                 $loginPage.fadeOut();
                 $drawPage.show();
                 $loginPage.off('click');
                 var url = 'http://' + window.location.hostname + ':' + env.PORT +'/';
                 console.log('User try socket: %s', url + roomcode);
                 drawsocket = io(url + roomcode, {rejectUnauthorized: false});
                 defineSocket();
                 socketReady = true;
                 if (session){
                   console.log("session found");
                   drawsocket.emit('reconnect user', {
                     'username': username,
                     'room': roomcode,
                     'id': drawsocket.id
                   });
                 }
                 else {
                   drawsocket.emit('add user', username);
                 }
                 navi.changePlayerState("draw", "Try drawing in the Lobby!");

               }
             }
             else {
                navi.changePlayerMessage("Wrong Room Code!");
                return false;
             }

             return true;
         })
         .catch(function (err) {
             console.log(err);
             return false;
         });
    }//end checkroom

    function setupDrawCanvasListeners(){
      // Get the position of a touch relative to the canvas
      function getTouchPos(canvasDom, touchEvent) {
        let offset = drawcanvas[0].getBoundingClientRect();
        return {
          x: touchEvent.touches[0].clientX - offset.left,
          y: touchEvent.touches[0].clientY - offset.top
        };
      }

      drawcanvas[0].addEventListener("touchstart", function(e) {
        //let mousePos = getTouchPos(drawcanvas[0], e);
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent("mousedown", {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        drawcanvas[0].dispatchEvent(mouseEvent);
      }, false);

      drawcanvas[0].addEventListener("touchend", function(e) {
        var mouseEvent = new MouseEvent("mouseup", {});
        drawcanvas[0].dispatchEvent(mouseEvent);
      }, false);

      drawcanvas[0].addEventListener("touchmove", function(e) {
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent("mousemove", {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        drawcanvas[0].dispatchEvent(mouseEvent);
      }, false);

      drawcanvas.on('mousedown', function(e) {
        e.preventDefault();
        ctx = $('#paper')[0].getContext('2d');
        drawing = true;
        //define drawing settings
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        if (type == 'ERASER'){
          ctx.lineWidth = 10;
          ctx.strokeStyle = '#FFFFFF';
          ctx.shadowBlur = 0;
          ctx.shadowColor = '#FFFFFF';
        }
        else {
          ctx.lineWidth = 4;
          ctx.strokeStyle = 'rgb(0, 0, 0)';
          ctx.shadowBlur = 1;
          ctx.shadowColor = 'rgb(0, 0, 0)';
        }
        let offset = drawcanvas[0].getBoundingClientRect();
        prev.x = e.pageX - offset.left;
        prev.y = e.pageY - offset.top;
        //push points into array
        points.length = 0;
        points.push({x: prev.x, y: prev.y});
        let socketid = drawsocket.id;
        drawsocket.emit('mousedown', {
          'x': prev.x,
          'y': prev.y,
          'drawing': true,
          'type': type,
          'id': socketid
        });
      });

      drawcanvas.bind('mouseup mouseleave', function(e) {
        drawing = false;
        if (type != 'ERASER'){
          drawLineQuad(drawsocket.id);
        }
        points.length = 0;
        drawsocket.emit('mouseup', {
          'drawing': false,
          'id': drawsocket.id
        });
      });

      let lastEmit = $.now();

      drawcanvas.on('mousemove', function(e) {
        if (socketReady) {
          let offset = drawcanvas[0].getBoundingClientRect();
          const xcord = e.pageX - offset.left;
          const ycord = e.pageY- offset.top;
          //push into points array
          points.push({x: prev.x, y: prev.y});
          //if points is bigger than 3 then we shift/keep size to 3
          if (points.length > 3){
            points.shift();
          }
          if ($.now() - lastEmit > 20) {
            let socketid = drawsocket.id;

            drawsocket.emit('mousemove', {
              'x': xcord,
              'y': ycord,
              'drawing': drawing,
              'type': type,
              'id': socketid
            });
            lastEmit = $.now();
          }
          // Draw a line for the current user's movement, as it is
          // not received in the socket.on('moving') event above
          if (drawing) {
            //drawLine(prev.x, prev.y, xcord, ycord);
            drawLineQuad(drawsocket.id);
            prev.x = xcord;
            prev.y = ycord;

          }
        }
      });
    }

    // Remove inactive clients after 10 seconds of inactivity
    setInterval(function() {

      for (var ident in clients) {
        if ($.now() - clients[ident].updated > 10000) {

          // Last update was more than 10 seconds ago.
          // This user has probably closed the page

          cursors[ident].remove();
          delete clients[ident];
          delete cursors[ident];
        }
      }

    }, 10000);

    function drawLine(fromx, fromy, tox, toy) {
      ctx.moveTo(fromx, fromy);
      ctx.lineTo(tox, toy);
      ctx.stroke();
    }

    function drawLineQuad(pid){
      //console.log(points);
      //if small points draw a dot
      if ((points.length > 0) && (points.length < 3))  {
  			let b = points[0];
  			ctx.beginPath();
  			ctx.arc(b.x, b.y, ctx.lineWidth / 2, 0, Math.PI * 2, !0);
  			ctx.fill();
  			ctx.closePath();
        drawsocket.emit('drawdot', {
          'x': prev.x,
          'y': prev.y,
          'drawing': true,
          'id': pid
        });
  			return;
  		}
      if (points.length != 0 ){
        ctx.beginPath();
  		  ctx.moveTo(points[0].x, points[0].y);
    		ctx.quadraticCurveTo(points[2].x, points[2].y, points[1].x, points[1].y);
    		ctx.stroke();
      }

    }

    $.resetPage = function(){
      window.location.href = "http://"+window.location.hostname+":"+env.PORT;
    }

    $.mountCanvas = function(){
      drawcanvas = $('#paper');
      drawcanvas.width = drawcanvas.width;
      setupDrawCanvasListeners();
    };

    $.mountCanvasOverlay = function(overlayUrl){
      let drawcanvas = $('#paper');
      //drawcanvas.append($('<img>', {id:'canvasoverlay', src:overlayUrl}));
      let ctx = drawcanvas[0].getContext('2d');
      let img = new Image();
      img.src = overlayUrl;
      img.onload=function(){
        ctx.drawImage(img,0,0);
      }

    };

    //send a mosueup event so you can't hold down the event between state changes
    $.clearMouseEvent = function(){
      var mouseEvent = new MouseEvent("mouseup", {});
      drawcanvas[0].dispatchEvent(mouseEvent);
    }

    $.subSend = function(payload){
      drawsocket.emit('sendbutton', {
        'data': payload,
        'id': username
      });
    };

    $.saveSession = function(payload){
      console.log("save session");
      drawsocket.emit('save session', payload);
    };

    $.voteSend = function(payload){
      drawsocket.emit('sendvote', {
        'data': payload,
        'id': username
      });
    };

    $.setDrawType = function(drawtype){
      type = drawtype;
    };

    // Sets the client's username
    function attemptRoomJoin() {
      username = cleanInput($usernameInput.val().trim()).toUpperCase();
      if (username.match(/\d+/g) != null){
        navi.changePlayerMessage("No numbers in nickname!");
        return false;
      }
      let roomcodeclean = cleanInput($roomInput.val().trim()).toUpperCase();
      room = roomcodeclean;
      //check if room exists here
      checkRoomCode(room);
    }

    // Prevents input from having injected markup
    function cleanInput(input) {
      return $('<div/>').text(input).text();
    }

    // Gets the color of a username through our hash function
    function getUsernameColor(username) {
      // Compute hash code
      var hash = 7;
      for (var i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + (hash << 5) - hash;
      }
      // Calculate color
      var index = Math.abs(hash % COLORS.length);
      return COLORS[index];
    }

    $('#enterroom').click(function(){
      //add room check and cookie check here
      //if isRoomExists and isCookieExists
      attemptRoomJoin();

    });

    // Keyboard events
    $window.keydown(function(event) {
      // When the client hits ENTER on their keyboard
      if (event.which === 13) {
        if (username) {
          typing = false;
        } else {
          attemptRoomJoin();
        }
      }
    });

    // Socket events
    function defineSocket() {
      // Whenever the server emits 'login', log the login message
      drawsocket.on('login', function(data) {
        connected = true;
        console.log(data);
        //store mainclient id
        mainclientid = data.mainclient;
      });

      drawsocket.on('moving', function(data) {
        if (!(data.id in clients)) {
          // a new user has come online. create a cursor for them
          cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
        }
        // Move the mouse pointer
        cursors[data.id].css({
          'left': data.x,
          'top': data.y
        });
        // Is the user drawing?
        if (data.drawing && clients[data.id]) {
          // Draw a line on the canvas. clients[data.id] holds
          // the previous position of this user's mouse pointer
          drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
        }
        // Saving the current client state
        clients[data.id] = data;
        clients[data.id].updated = $.now();
      });

      drawsocket.on('changestateall', function(data) {
        console.log(data.state + ' ' + data.message);
        navi.changePlayerState(data.state, data.message, data.payload);
      });

      drawsocket.on('forcebuttonsubmit', function(data) {
        console.log(data.username + ' joined');
        $.subSend(data.username);
        navi.changePlayerState('msg', 'game moving on', 'main msg: game moving on');
      });

      drawsocket.on('makeadmin', function(data) {
        console.log('set admin');
        navi.setAdmin();
      });

      drawsocket.on('update username', function(data) {
        console.log('update username');
        username = data.username;
        drawsocket.emit('update sessionusername', username);
      });

      drawsocket.on('changegame', function(data) {
        console.log('changegame to ' + data.game);
        navi.setGame(data.game);
      });

      // Whenever the server emits 'user joined', log it in the chat body
      drawsocket.on('user joined', function(data) {
        console.log(data.username + ' joined');
      });

      // Whenever the server emits 'user left', log it in the chat body
      drawsocket.on('user left', function(data) {
        console.log(data.username + ' left');
      });

      drawsocket.on('disconnect', function(data) {
        console.log('you have been disconnected');
      });

      drawsocket.on('reconnect', function(data) {
        console.log('you have been reconnected');
      });

      drawsocket.on('reconnect_error', function() {
        console.log('attempt to reconnect has failed');
      });

      drawsocket.on('kicked', function(data) {
        navi.changePlayerState('msg', 'You have been removed from lobby.');
        //helper leave game function, go to main page
        $.resetPage();
        drawsocket.emit("disconnect");
      });
    }
});
