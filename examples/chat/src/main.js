/*jshint esversion: 6 */
import io from 'socket.io-client';

  $(function () {
    const FADE_TIME = 150; // ms
    const TYPING_TIMER_LENGTH = 400; // ms
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

    let socket;
    var drawObj;

    let mainclientid;

    // This demo depends on the canvas element
    if (!('getContext' in document.createElement('canvas'))) {
      alert('Sorry, it looks like your browser does not support canvas!');
      return false;
    }

    const doc = $(document),
      win = $(window),
      drawcanvas = $('#paper'),
      ctx = drawcanvas[0].getContext('2d'),
      instructions = $('#instructions');

    // Generate an unique ID
    let id = Math.round($.now() * Math.random());

    // A flag for drawing activity
    let drawing = false;

    let clients = {};
    let cursors = {};

    let prev = {};

    // Get the position of a touch relative to the canvas
    function getTouchPos(canvasDom, touchEvent) {
      let offset = drawcanvas[0].getBoundingClientRect();
      return {
        x: touchEvent.touches[0].clientX - offset.left,
        y: touchEvent.touches[0].clientY - offset.top
      };
    }

    drawcanvas[0].addEventListener("touchstart", function(e) {
      mousePos = getTouchPos(drawcanvas[0], e);
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
      drawing = true;
      let offset = drawcanvas[0].getBoundingClientRect();
      prev.x = e.pageX - offset.left;
      prev.y = e.pageY - offset.top;
    });

    drawcanvas.bind('mouseup mouseleave', function() {
      drawing = false;
    });

    var lastEmit = $.now();

    drawcanvas.on('mousemove', function(e) {
      if (socketReady) {
        let offset = drawcanvas[0].getBoundingClientRect();
        const xcord = e.pageX - offset.left;
        const ycord = e.pageY- offset.top;
        if ($.now() - lastEmit > 30) {
          let socketid = socket.id;
          console.log(mainclientid);

          socket.emit('mousemove', {
            'x': xcord,
            'y': ycord,
            'drawing': drawing,
            'id': socketid
          });
          lastEmit = $.now();
        }
        // Draw a line for the current user's movement, as it is
        // not received in the socket.on('moving') event above
        if (drawing) {
          drawLine(prev.x, prev.y, xcord, ycord);
          prev.x = xcord;
          prev.y = ycord;

        }
      }
    });

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

    // Sets the client's username
    function setUsername() {
      var username = cleanInput($usernameInput.val().trim());
      let roomcodeclean = cleanInput($roomInput.val().trim()).toUpperCase();
      room = roomcodeclean;
      if (username) {
        $loginPage.fadeOut();
        $drawPage.show();
        $loginPage.off('click');
        var url = 'http://' + window.location.hostname + ':3000/';
        socket = io(url + room);
        defineSocket();
        socketReady = true;
        console.log('User try socket: %s', url + room);
        // Tell the server your username
        socket.emit('add user', username);
      }
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

    // Keyboard events
    $window.keydown(function(event) {
      // Auto-focus the current input when a key is typed
      if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        //$currentInput.focus();
      }
      // When the client hits ENTER on their keyboard
      if (event.which === 13) {
        if (username) {
          sendMessage();
          socket.emit('stop typing');
          typing = false;
        } else {
          setUsername();
        }
      }
    });

    // Socket events
    function defineSocket() {
      // Whenever the server emits 'login', log the login message
      socket.on('login', function(data) {
        connected = true;
        console.log(data);
        //store mainclient id
        mainclientid = data.mainclient;
      });

      socket.on('moving', function(data) {

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

      // Whenever the server emits 'user joined', log it in the chat body
      socket.on('user joined', function(data) {
        console.log(data.username + ' joined');
      });

      // Whenever the server emits 'user left', log it in the chat body
      socket.on('user left', function(data) {
        console.log(data.username + ' left');
      });

      socket.on('disconnect', function() {
        console.log('you have been disconnected');
      });

      socket.on('reconnect', function() {
        console.log('you have been reconnected');
        if (username) {
          socket.emit('add user', username);
        }
      });

      socket.on('reconnect_error', function() {
        console.log('attempt to reconnect has failed');
      });
    }
});