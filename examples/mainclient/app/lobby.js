'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRouterDom = require('react-router-dom');

var _minigameone = require('./minigameone');

var minigameone = _interopRequireWildcard(_minigameone);

var _reactRedux = require('react-redux');

var ReactRedux = _interopRequireWildcard(_reactRedux);

var _redux = require('redux');

var Redux = _interopRequireWildcard(_redux);

var _env = require('./env');

var _env2 = _interopRequireDefault(_env);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*jshint esversion: 6 */

var HOSTNAME = _env2.default.serverendpoint;
var PORT = _env2.default.serverport;

var LobbyScreen = function (_React$Component) {
  _inherits(LobbyScreen, _React$Component);

  function LobbyScreen(props) {
    _classCallCheck(this, LobbyScreen);

    return _possibleConstructorReturn(this, (LobbyScreen.__proto__ || Object.getPrototypeOf(LobbyScreen)).call(this, props));
  }

  _createClass(LobbyScreen, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      this.interval = setInterval(function () {
        return _this2.startGame();
      }, 1000);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      clearInterval(this.interval);
    }

    //function that is called when admin starts game

  }, {
    key: 'startGame',
    value: function startGame() {
      //
      if (this.props.game == 'gameone') {
        if (this.props.history.location.pathname != '/minigameone') {
          $.callstatechangeall('msg', 'start rules');
          this.props.history.push('/minigameone');
          minigameone.storeTimer.dispatch(minigameone.startTimer(10));
        }
      } else {
        //do nothing
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'div',
          { className: 'row' },
          _react2.default.createElement(
            'div',
            { className: 'col-sm-3 text-center', align: 'center' },
            _react2.default.createElement('canvas', { id: 'canvas-p0', width: '268', height: '340' }),
            'p1'
          ),
          _react2.default.createElement(
            'div',
            { className: 'col-sm-3 text-center', align: 'center' },
            _react2.default.createElement('canvas', { id: 'canvas-p1', width: '268', height: '340' }),
            'p2'
          ),
          _react2.default.createElement(
            'div',
            { className: 'col-sm-3 text-center', align: 'center' },
            _react2.default.createElement('canvas', { id: 'canvas-p2', width: '268', height: '340' })
          ),
          _react2.default.createElement(
            'div',
            { className: 'col-sm-3 text-center', align: 'center' },
            _react2.default.createElement('canvas', { id: 'canvas-p3', width: '268', height: '340' })
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'row' },
          _react2.default.createElement(
            'div',
            { className: 'col-sm-3 text-center', align: 'center' },
            _react2.default.createElement('canvas', { id: 'canvas-p4', width: '268', height: '340' })
          ),
          _react2.default.createElement(
            'div',
            { className: 'col-sm-3 text-center', align: 'center' },
            _react2.default.createElement('canvas', { id: 'canvas-p5', width: '268', height: '340' })
          ),
          _react2.default.createElement(
            'div',
            { className: 'col-sm-3 text-center', align: 'center' },
            _react2.default.createElement('canvas', { id: 'canvas-p6', width: '268', height: '340' })
          ),
          _react2.default.createElement(
            'div',
            { className: 'col-sm-3 text-center', align: 'center' },
            _react2.default.createElement('canvas', { id: 'canvas-p7', width: '268', height: '340' })
          )
        )
      );
    }
  }]);

  return LobbyScreen;
}(_react2.default.Component);

var About = function (_React$Component2) {
  _inherits(About, _React$Component2);

  function About() {
    _classCallCheck(this, About);

    return _possibleConstructorReturn(this, (About.__proto__ || Object.getPrototypeOf(About)).apply(this, arguments));
  }

  _createClass(About, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        'About page'
      );
    }
  }]);

  return About;
}(_react2.default.Component);

var initialMainGameState = {
  gamestate: "LOBBY"
};
//action creators
// Action Creators
function startGame(gamename) {
  return {
    type: "MINIGAMEONE",
    gamestate: gamename
  };
}
//reducer
function maingamereducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialMainGameState;
  var action = arguments[1];

  switch (action.type) {
    case "LOBBY":
      return _extends({}, state, {
        //set new state
        gamestate: action.gamestate
      });
    case "MINIGAMEONE":
      //alert("discuss state");
      return _extends({}, state, {
        //set new state
        gamestate: 'gameone'
      });
    default:
      return state;
  }
}

var MainFrame = function (_React$Component3) {
  _inherits(MainFrame, _React$Component3);

  function MainFrame() {
    _classCallCheck(this, MainFrame);

    return _possibleConstructorReturn(this, (MainFrame.__proto__ || Object.getPrototypeOf(MainFrame)).apply(this, arguments));
  }

  _createClass(MainFrame, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.interval = setInterval(this.forceUpdate.bind(this), 1000);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      clearInterval(this.interval);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this5 = this;

      var gamestatelabel = this.props.gamestate;

      return _react2.default.createElement(
        _reactRouterDom.BrowserRouter,
        null,
        _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'ul',
            null,
            _react2.default.createElement(
              'li',
              null,
              _react2.default.createElement(
                _reactRouterDom.Link,
                { to: '/' },
                'Home'
              )
            ),
            _react2.default.createElement(
              'li',
              null,
              _react2.default.createElement(
                _reactRouterDom.Link,
                { to: '/minigameone' },
                'minigameone'
              )
            )
          ),
          _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/', render: function render(props) {
              return _react2.default.createElement(LobbyScreen, _extends({}, props, { game: _this5.props.gamestate }));
            } }),
          _react2.default.createElement(_reactRouterDom.Route, { path: '/minigameone', component: _minigameone.MiniGameOneLayout })
        )
      );
    }
  }]);

  return MainFrame;
}(_react2.default.Component);

function mapStateToPropsMainFrame(state) {
  return { gamestate: state.gamestate
  };
}
MainFrame = ReactRedux.connect(mapStateToPropsMainFrame, { startGame: startGame })(MainFrame);
var storeMainGame = Redux.createStore(maingamereducer);

_reactDom2.default.render(_react2.default.createElement(
  ReactRedux.Provider,
  { store: storeMainGame },
  _react2.default.createElement(MainFrame, null)
), document.getElementById('mainframe'));

$(function () {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = ['#e21400', '#91580f', '#f8a700', '#f78b00', '#58dc00', '#287b00', '#a8f07a', '#4ae8c4', '#3b88eb', '#3824aa', '#a700ff', '#d300e7'];

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

  var clients = {};
  var cursors = {};
  var clientdict = {};
  var votes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var playernumToId = {};
  var playerIdToNum = {};

  var lastVoteData = void 0;
  var socket;

  //helper socket functions
  $.callstatechangeall = function (mode) {
    var msg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
    var payload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";

    console.log("try to emit changestateall");
    socket.emit('changestateall', {
      state: mode,
      message: msg,
      payload: payload
    });
  };

  $.callstatechangeprivate = function (mode) {
    var msg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
    var clientid = arguments[2];
    var payload = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";

    console.log("try to emit changestateprivate");
    socket.emit('changestateprivate', {
      state: mode,
      message: msg,
      payload: payload,
      client: clientid
    });
  };

  $.clearAllCanvas = function () {
    $.each($('canvas'), function (index, canvas) {
      var context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
    });
  };

  //return all players
  $.returnAllPlayers = function () {
    return clientdict;
  };

  //return majority vote
  $.retMajorityVote = function () {
    return returnMajorityVote();
  };

  $.retDataVote = function () {
    return lastVoteData;
  };

  function drawLine(fromx, fromy, tox, toy, playerid) {
    var drawcanvas = $('#' + clientdict[playerid].canvasid);
    var ctxdrawcanvas = drawcanvas[0].getContext('2d');
    ctxdrawcanvas.moveTo(fromx, fromy);
    ctxdrawcanvas.lineTo(tox, toy);
    ctxdrawcanvas.stroke();
  }

  function connectToSocket(roomCode) {
    socket = require('socket.io-client')('http://' + HOSTNAME + ':' + PORT + '/' + roomCode);
    console.log('try: %s', 'http://' + HOSTNAME + ':' + PORT + '/' + roomCode);
    defineSocket();
    log(roomCode, {
      prepend: true
    });
    setTimeout(function () {
      console.log("waiting");
    }, 2000);
    setUsername();
  }

  // Socket events
  function defineSocket() {
    // Whenever the server emits 'login', log the login message
    socket.on('login', function (data) {
      connected = true;
    });

    socket.on('moving', function (data) {
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

    // Whenever the server emits 'sendbutton'
    socket.on('sendbutton', function (data) {
      //trigger startgame
      console.log('get sendbutton');
      //only if admin then start the game.
      if (data.data == "admin") {
        storeMainGame.dispatch(startGame('gameone'));
      }
    });

    socket.on('sendvote', function (data) {
      //trigger startgame
      console.log('get sendvote');
      //update vote
      updateVote(data);
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', function (data) {
      addChatMessage(data);
    });

    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', function (data) {
      //TODO: add a player canvas
      if (data.username != 'mainclient') {
        var canvasnum = Object.keys(clientdict).length;
        var playerobj = {};
        playerobj["username"] = data.username;
        playerobj["isadmin"] = false;
        playerobj["canvasid"] = 'canvas-p' + canvasnum;
        playerobj["playernum"] = canvasnum;
        playerobj["socketid"] = data.id;
        clientdict[data.id] = playerobj;
        //update playernum to id map
        playernumToId[canvasnum] = data.username;
        playerIdToNum[data.username] = canvasnum;

        if (canvasnum == 0) {
          //make admin
          socket.emit('makeadmin', {
            message: 'you are admin',
            client: data.id
          });
        }
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

  function getRoomCode() {
    var rp = require('request-promise');
    console.log('request to : ' + 'http://' + HOSTNAME + ':' + PORT + '/createRoom');
    var options = {
      method: 'POST',
      uri: 'http://' + HOSTNAME + ':' + PORT + '/createRoom', //'http://ec2-13-59-140-62.us-east-2.compute.amazonaws.com/createRoom',
      body: {
        some: 'payload'
      },
      json: true // Automatically stringifies the body to JSON
    };
    console.log('getroomcode');
    rp(options).then(function (parsedBody) {
      // POST succeeded...
      console.log('room code: %s', parsedBody);
      connectToSocket(parsedBody);
    }).catch(function (err) {
      // POST failed...
      console.log(err);
    });
  }

  function updateVote(data) {
    console.log(data);
    console.log(playerIdToNum);
    //save last vote data
    lastVoteData = data.data;
    //get playerid to num
    var num = playerIdToNum[data.data];
    votes[num]++;
    console.log(votes);
  }

  //returns null if there is no majority
  //returns player num of majority vote
  //TODO: bad return inconsistent type
  function returnMajorityVote() {
    console.log(votes);
    //loop through
    var majority = 0;
    var playernum = 0;
    var tie = false;
    var ret = {};
    for (var i = 0; i < votes.length; i++) {
      if (votes[i] > majority) {
        playernum = i;
        majority = votes[i];
        tie = false;
      } else if (votes[i] == majority) {
        tie = true;
      }
    }

    if (tie) {
      return -1;
    } else {
      return playernum;
    }
  }

  function addParticipantsMessage(data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }

  // Sets the client's username
  function setUsername() {
    username = 'mainclient';

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      setTimeout(function () {
        console.log("waiting in set username");
      }, 2000);
      // Tell the server your username
      socket.emit('add user', username);
    }
  }

  // Sends a chat message
  function sendMessage() {
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
  function log(message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage(data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>').text(data.username).css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">').text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>').data('username', data.username).addClass(typingClass).append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping(data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping(data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement(el, options) {
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
  function cleanInput(input) {
    return $('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTyping() {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = new Date().getTime();

      setTimeout(function () {
        var typingTimer = new Date().getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages(data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
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

  getRoomCode();
});