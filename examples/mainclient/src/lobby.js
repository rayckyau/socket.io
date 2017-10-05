/*jshint esversion: 6 */

import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Link,
  withRouter
} from 'react-router-dom'
import {TestLayout, MiniGameOneLayout} from './minigameone'

class Hello extends React.Component {

  //function that is called when admin starts game
  startGame(){
    //
    this.props.history.push('/about');
  }

  render() {
    return (
      <div>
      <button type="button" onClick={() => this.startGame()}>but</button>
      <div className="row">
        <div className="col-sm-3">
          <canvas id="canvas-p0" width="268" height="340"></canvas>
        </div>
        <div className="col-sm-3">
          <canvas id="canvas-p1" width="268" height="340"></canvas>
        </div>
        <div className="col-sm-3">
          <canvas id="canvas-p2" width="268" height="340"></canvas>
        </div>
        <div className="col-sm-3">
          <canvas id="canvas-p3" width="268" height="340"></canvas>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-3">
          <canvas id="canvas-p4" width="268" height="340"></canvas>
        </div>
        <div className="col-sm-3">
          <canvas id="canvas-p5" width="268" height="340"></canvas>
        </div>
        <div className="col-sm-3">
          <canvas id="canvas-p6" width="268" height="340"></canvas>
        </div>
        <div className="col-sm-3">
          <canvas id="canvas-p7" width="268" height="340"></canvas>
        </div>
      </div>
      </div>
    );
  }
}

class About extends React.Component {
  render() {
    return (
      <div>
      About page
      </div>
    );
  }
}

class MainFrame extends React.Component {

  render() {

    return (
      <Router>
        <div>

          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/minigameone">minigameone</Link></li>
            <li><Link to="/topics">Topics</Link></li>
          </ul>

            <Route exact path="/" component={Hello}/>
            <Route path="/minigameone" component={MiniGameOneLayout}/>

          </div>
        </Router>
    );
  }
}

ReactDOM.render(<MainFrame />, document.getElementById('mainframe'));

$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page

  // Prompt for setting a username
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  let clients = {};
  let cursors = {};
  let clientdict = {};

  var socket;

  function drawLine(fromx, fromy, tox, toy, playerid) {
    const drawcanvas = $('#'+clientdict[playerid].canvasid);
    const ctxdrawcanvas = drawcanvas[0].getContext('2d');
    ctxdrawcanvas.moveTo(fromx, fromy);
    ctxdrawcanvas.lineTo(tox, toy);
    ctxdrawcanvas.stroke();
  }

  function connectToSocket(roomCode){
     socket = require('socket.io-client')('http://localhost:3000/'+roomCode);
     console.log('try: %s', 'http://localhost:3000/'+roomCode);
     defineSocket();
     log(roomCode, {
       prepend: true
     });
     setTimeout(function(){
         console.log("waiting");
       }, 2000);
     setUsername();
  }

  // Socket events
  function defineSocket(){
    // Whenever the server emits 'login', log the login message
    socket.on('login', function (data) {
      connected = true;
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
        drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y, data.id);
      }
      // Saving the current client state
      clients[data.id] = data;
      clients[data.id].updated = $.now();
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', function (data) {
      addChatMessage(data);
    });

    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', function (data) {
      //TODO: add a player canvas
      if (data.username != 'mainclient'){
        let canvasnum = Object.keys(clientdict).length;
        const playerobj = {};
        playerobj["username"] = data.username;
        playerobj["isadmin"] = false;
        playerobj["canvasid"] = 'canvas-p'+canvasnum;
        playerobj["socketid"] = data.id;
        clientdict[data.id] = playerobj;
      }
      log(data.username + ' joined');
      addParticipantsMessage(data);
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', function (data) {
      //TODO: remove player from dict
      log(data.username + ' left');
      addParticipantsMessage(data);
      removeChatTyping(data);
    });

    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', function (data) {
      addChatTyping(data);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', function (data) {
      removeChatTyping(data);
    });

    socket.on('disconnect', function () {
      log('you have been disconnected');
    });

    socket.on('reconnect', function () {
      log('you have been reconnected');
      if (username) {
        socket.emit('add user', username);
      }
    });

    socket.on('reconnect_error', function () {
      log('attempt to reconnect has failed');
    });
  }

  function getRoomCode(){
    var rp = require('request-promise');
    var options = {
        method: 'POST',
        uri: 'http://localhost:3000/createRoom',
        body: {
            some: 'payload'
        },
        json: true // Automatically stringifies the body to JSON
    };
    console.log('getroomcode');
    rp(options)
        .then(function (parsedBody) {
            // POST succeeded...
            console.log('room code: %s', parsedBody);
            connectToSocket(parsedBody);
        })
        .catch(function (err) {
            // POST failed...
            console.log(err);
        });

  }

  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }

  // Sets the client's username
  function setUsername () {
    username = 'mainclient';

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      setTimeout(function(){
          console.log("waiting in set username");
        }, 2000);
      // Tell the server your username
      socket.emit('add user', username);
    }
  }

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message);
    }
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  getRoomCode();


});
