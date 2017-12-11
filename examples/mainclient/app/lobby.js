'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRouterDom = require('react-router-dom');

var _reshake = require('reshake');

var _reactSlick = require('react-slick');

var _reactSlick2 = _interopRequireDefault(_reactSlick);

var _minigameone = require('./minigameone');

var minigameone = _interopRequireWildcard(_minigameone);

var _gameselect = require('./gameselect');

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

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*jshint esversion: 6 */
var fs = require('fs'),
    path = require('path'),
    certFile = path.resolve(__dirname, 'sslcert/client1-crt.pem'),
    keyFile = path.resolve(__dirname, 'sslcert/client1-key.pem'),
    caFile = path.resolve(__dirname, 'sslcert/ca-crt.pem');
var https = require('https');


var HOSTNAME = _env2.default.serverendpoint;
var PORT = _env2.default.serverport;

var LobbyScreen = function (_React$Component) {
  _inherits(LobbyScreen, _React$Component);

  function LobbyScreen(props) {
    _classCallCheck(this, LobbyScreen);

    var _this = _possibleConstructorReturn(this, (LobbyScreen.__proto__ || Object.getPrototypeOf(LobbyScreen)).call(this, props));

    _this.state = { playerlabels: ['Player1 Join', 'Player2 Join', 'Player3 Join', 'Player4 Join', 'Player5 Join', 'Player6 Join', 'Player7 Join', 'Player8 Join'] };
    return _this;
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
      //update player names
      //TODO: optimize by checking if state has changed first
      for (var key in $.getplayernumToUser()) {
        if ($.getplayernumToUser().hasOwnProperty(key)) {
          this.state.playerlabels[key] = $.getplayernumToUser()[key];
        }
      }
      this.setState({ playerlabels: this.state.playerlabels });
      console.log("in startgame: " + this.props.gamestate);
      if (this.props.gamestate == 'minigameone') {
        if (this.props.history.location.pathname != '/minigameone') {
          $.callstatechangeall('msg', 'start rules');
          minigameone.storeTimer.dispatch(minigameone.startTimer(31));
          minigameone.storeGame.dispatch(minigameone.startIdle());
          this.props.history.push('/minigameone');
        }
      } else if (this.props.gamestate == 'lobby') {
        if (this.props.history.location.pathname != '/') {
          this.props.history.push('/');
          $.callstatechangeall('draw', 'Draw something!');
        }
      } else if (this.props.gamestate == 'gameselect') {
        if (this.props.history.location.pathname != '/gameselect') {
          this.props.history.push('/gameselect');
        }
      } else {
        //do nothing
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var canvasitems = this.state.playerlabels.map(function (playername, index) {
        return _react2.default.createElement(
          'div',
          { className: 'col-sm-3 text-center', key: "canvas-p" + index },
          _react2.default.createElement('canvas', { id: "canvas-p" + index, width: "268", height: "340" }),
          _react2.default.createElement('br', null),
          _react2.default.createElement(
            'div',
            { id: "playerlabel" + index },
            _this3.state.playerlabels[index]
          )
        );
      });
      return _react2.default.createElement(
        'div',
        { className: 'row' },
        canvasitems
      );
    }
  }]);

  return LobbyScreen;
}(_react2.default.Component);

var initialMainGameState = {
  gamestate: "lobby"
};
//action creators
// Action Creators
function startGame(gamename) {
  console.log("action creator startgame: " + gamename);
  $.sendGameState('minigameone');

  return {
    type: "MINIGAMEONE",
    gamestate: 'minigameone'
  };
}
function startGameSelect() {
  $.sendGameState("gameselect");
  return {
    type: "GAMESELECT",
    gamestate: "gameselect"
  };
}
function startLobby() {
  $.sendGameState("lobby");
  return {
    type: "LOBBY",
    gamestate: "lobby"
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
        gamestate: 'lobby'
      });
    case "GAMESELECT":
      return _extends({}, state, {
        gamestate: 'gameselect'
      });
    case "MINIGAMEONE":
      //alert("discuss state");
      return _extends({}, state, {
        //set new state
        gamestate: 'minigameone'
      });
    default:
      return state;
  }
}

var MainFrame = function (_React$Component2) {
  _inherits(MainFrame, _React$Component2);

  function MainFrame() {
    _classCallCheck(this, MainFrame);

    return _possibleConstructorReturn(this, (MainFrame.__proto__ || Object.getPrototypeOf(MainFrame)).apply(this, arguments));
  }

  _createClass(MainFrame, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      //this.interval = setInterval(this.forceUpdate.bind(this), 1000);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      //clearInterval(this.interval);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _reactRouterDom.HashRouter,
        null,
        _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/', component: LobbyScreen }),
          _react2.default.createElement(_reactRouterDom.Route, { path: '/minigameone', component: _minigameone.MiniGameOneLayout }),
          _react2.default.createElement(_reactRouterDom.Route, { path: '/gameselect', component: _gameselect.GameSelectScreen })
        )
      );
    }
  }]);

  return MainFrame;
}(_react2.default.Component);

var Rules = function (_React$Component3) {
  _inherits(Rules, _React$Component3);

  function Rules() {
    _classCallCheck(this, Rules);

    return _possibleConstructorReturn(this, (Rules.__proto__ || Object.getPrototypeOf(Rules)).apply(this, arguments));
  }

  _createClass(Rules, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this6 = this;

      this.interval = setInterval(function () {
        return _this6.onGameStart();
      }, 1000);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      clearInterval(this.interval);
    }
  }, {
    key: 'onGameStart',
    value: function onGameStart() {
      if (this.props.gamestate == "minigameone") {
        var settings = {
          autoplaySpeed: 10000,
          slidesToShow: 1,
          slidesToScroll: 1,
          autoplay: true
        };
        return _react2.default.createElement(
          _reactSlick2.default,
          settings,
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement('img', { src: 'ruleslides/illuminatiimposterslides1.png', height: '100%', width: '100%' })
          ),
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement('img', { src: 'ruleslides/illuminatiimposterslides2.png', height: '100%', width: '100%' })
          ),
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement('img', { src: 'ruleslides/illuminatiimposterslides3.png', height: '100%', width: '100%' })
          )
        );
      } else {
        return _react2.default.createElement(
          'div',
          null,
          "No rules to display here"
        );
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        this.onGameStart()
      );
    }
  }]);

  return Rules;
}(_react2.default.Component);

function mapStateToPropsMainFrame(state) {
  return { gamestate: state.gamestate
  };
}
function mapStateToPropsRules(state) {
  return { gamestate: state.gamestate
  };
}
MainFrame = ReactRedux.connect(mapStateToPropsMainFrame, { startGame: startGame, startLobby: startLobby })(MainFrame);
LobbyScreen = (0, _reactRouterDom.withRouter)(ReactRedux.connect(mapStateToPropsMainFrame)(LobbyScreen));
Rules = ReactRedux.connect(mapStateToPropsRules)(Rules);

var storeMainGame = Redux.createStore(maingamereducer);

_reactDom2.default.render(_react2.default.createElement(
  ReactRedux.Provider,
  { store: storeMainGame },
  _react2.default.createElement(MainFrame, null)
), document.getElementById('mainframe'));

_reactDom2.default.render(_react2.default.createElement(
  'div',
  { className: 'title' },
  'HappyDraw'
), document.getElementById('happydrawtitle'));

_reactDom2.default.render(_react2.default.createElement(
  ReactRedux.Provider,
  { store: storeMainGame },
  _react2.default.createElement(Rules, null)
), document.getElementById('rules'));

$(function () {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = ['#DC4c46', '#4f84c4', '#d8ae47', '#ce3175', '#005960', '#e15d44', '#b565a7', '#000', '#3b88eb', '#3824aa', '#a700ff', '#d300e7'];

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
  var isReady = [false, false, false, false, false, false, false, false, false, false];
  var voteData = ['', '', '', '', '', '', '', '', '', '', '', ''];
  var playernumToUser = {};
  var playerUserToNum = {};
  var usernameToSocketid = {};
  var playercount = 0;
  var clientsDrawpoints = {};
  var lastVoteData = void 0;
  var socket;

  //helper gamestate functions
  $.changeGameState = function (gamename) {
    console.log("try to change game:" + gamename);
    storeMainGame.dispatch(startGame(gamename));
  };

  $.changeToLobby = function () {
    storeMainGame.dispatch(startLobby());
  };

  //helper socket functions
  $.sendGameState = function (gamestate) {
    socket.emit('changegame', {
      message: 'changing gamestate of mainclient',
      game: gamestate
    });
  };

  $.callstatechangeall = function (mode) {
    var msg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
    var payload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";

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

  //takes player socketid and clears the canvas
  //TODO: not working
  $.clearSelectedCanvas = function (playerid) {
    var canvas = $('#' + clientdict[playerid].canvasid);
    var context = canvas[0].getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  $.getAllCanvas = function () {
    var canvasarray = [];
    $.each($('canvas'), function (index, canvas) {
      canvasarray[index] = canvas;
    });
    return canvasarray;
  };

  $.getplayernumToUser = function () {
    return playernumToUser;
  };

  $.getPlayernumById = function (username) {
    return playerUserToNum[username];
  };

  //return all players
  $.returnAllPlayers = function () {
    return clientdict;
  };

  //get sendbutton counter for num of palyers rdy
  $.isReadyPlayers = function () {
    for (var i = 0; i < playercount; i++) {
      if (isReady[i] == false) {
        return false;
      }
    }
    return true;
  };

  $.isReadyPlayerId = function (id) {
    return isReady[playerUserToNum[id]];
  };

  $.isReadyPlayerNum = function (num) {
    return isReady[num];
  };

  $.resetReadyPlayers = function () {
    for (var i = 0; i < playercount; i++) {
      isReady[i] = false;
    }
  };

  $.resetLastVoteData = function () {
    lastVoteData = null;
  };

  //clear votes
  $.resetVotes = function () {
    for (var i = 0; i < votes.length; i++) {
      votes[i] = 0;
      voteData[i] = 0;
    }
  };

  $.retlastVote = function () {
    return lastVoteData;
  };

  $.retVoteData = function () {
    return voteData;
  };

  $.retVotes = function () {
    return votes;
  };

  /*this function will return the username if no duplicates exists
  if a duplicate exists then it will return the username with a number appended
  where the number is N+1 with N duplicate occurances found.
  */
  $.sanityReturnUsername = function (username) {
    var duplicateCount = 1;
    for (var key in clientdict) {
      if (clientdict.hasOwnProperty(key)) {
        var playerobj = clientdict[key];
        if (username === playerobj.username || username === playerobj.username.slice(0, playerobj.username.length - 1)) {
          duplicateCount++;
        }
      }
    }
    if (duplicateCount > 1) {
      return username + duplicateCount.toString();
    } else {
      return username;
    }
  };

  function drawLine(fromx, fromy, tox, toy, playerid) {
    var drawcanvas = $('#' + clientdict[playerid].canvasid);
    var ctxdrawcanvas = drawcanvas[0].getContext('2d');
    //define drawing settings
    ctxdrawcanvas.lineWidth = 4;
    ctxdrawcanvas.lineJoin = 'round';
    ctxdrawcanvas.lineCap = 'round';
    ctxdrawcanvas.shadowBlur = 4;
    ctxdrawcanvas.shadowColor = COLORS[clientdict[playerid].playernum];
    ctxdrawcanvas.strokeStyle = COLORS[clientdict[playerid].playernum];
    ctxdrawcanvas.beginPath();
    ctxdrawcanvas.moveTo(fromx, fromy);
    ctxdrawcanvas.lineTo(tox, toy);
    ctxdrawcanvas.stroke();
  }

  function drawDot(fromx, fromy, playerid) {
    var drawcanvas = $('#' + clientdict[playerid].canvasid);
    var ctxdrawcanvas = drawcanvas[0].getContext('2d');
    ctxdrawcanvas.fillStyle = COLORS[clientdict[playerid].playernum];
    ctxdrawcanvas.beginPath();
    ctxdrawcanvas.arc(fromx, fromy, ctxdrawcanvas.lineWidth / 2, 0, Math.PI * 2, !0);
    ctxdrawcanvas.fill();
    ctxdrawcanvas.closePath();
  }

  function drawLineQuad(fromx, fromy, playerid) {
    var drawcanvas = $('#' + clientdict[playerid].canvasid);
    var ctxdrawcanvas = drawcanvas[0].getContext('2d');
    //define drawing settings
    ctxdrawcanvas.lineWidth = 4;
    ctxdrawcanvas.lineJoin = 'round';
    ctxdrawcanvas.lineCap = 'round';

    //draw dots
    if (pointsarray.length > 0 && pointsarray.length < 3) {
      var b = pointsarray[0];
      ctxdrawcanvas.beginPath();
      ctxdrawcanvas.arc(b.x, b.y, ctxdrawcanvas.lineWidth / 2, 0, Math.PI * 2, !0);
      ctxdrawcanvas.fill();
      ctxdrawcanvas.closePath();
      return;
    }
    ctxdrawcanvas.beginPath();
    ctxdrawcanvas.moveTo(pointsarray[0].x, pointsarray[0].y);
    ctxdrawcanvas.quadraticCurveTo(pointsarray[2].x, pointsarray[2].y, pointsarray[1].x, pointsarray[1].y);
    ctxdrawcanvas.stroke();
  }

  function connectToSocket(roomCode) {
    //process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    https.globalAgent.options.rejectUnauthorized = false;
    socket = require('socket.io-client')('http://' + HOSTNAME + ':' + PORT + '/' + roomCode);
    console.log('try: %s', 'http://' + HOSTNAME + ':' + PORT + '/' + roomCode);
    defineSocket();
    log('Room Code: ' + roomCode, {
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
        //create drawpoints array for new user
        clientsDrawpoints[data.id] = [];
        //TODO: cleanup if user leaves
      }

      // Is the user drawing?
      if (data.drawing == true && clients[data.id]) {
        // Draw a line on the canvas. clients[data.id] holds
        // the previous position of this user's mouse pointer
        //update drawing points for client
        //if array points is greater than 3 then trim it
        if (clientsDrawpoints[data.id].length > 3) {
          clientsDrawpoints[data.id].shift();
        }
        clientsDrawpoints[data.id].push({ x: data.x, y: data.y });
        //drawLineQuad(clientsDrawpoints[data.id], data.id);
        drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y, data.id);
      }
      // Saving the current client state
      clients[data.id] = data;
      clients[data.id].updated = $.now();
    });

    socket.on('pendown', function (data) {
      if (!(data.id in clients)) {
        // a new user has come online. create a cursor for them
        cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
        //create drawpoints array for new user
        clientsDrawpoints[data.id] = [];
        //TODO: cleanup if user leaves
      }
      //reset drawing points array
      clientsDrawpoints[data.id].length = 0;
      if (data.drawing == true && clients[data.id]) {
        clientsDrawpoints[data.id].push({ x: data.x, y: data.y });
      }
      // Saving the current client state
      clients[data.id] = data;
      clients[data.id].updated = $.now();
    });

    socket.on('penup', function (data) {
      //drawLineQuad(clientsDrawpoints[data.id], data.id);
      clientsDrawpoints[data.id] = [];
      // Saving the current client state
      clients[data.id] = data;
      clients[data.id].updated = $.now();
    });

    socket.on('drawdot', function (data) {
      drawDot(data.x, data.y, data.id);
      clientsDrawpoints[data.id] = [];
      // Saving the current client state
      clients[data.id] = data;
      clients[data.id].updated = $.now();
    });

    // Whenever the server emits 'sendbutton'
    socket.on('sendbutton', function (data) {
      if (data.data == "ready") {
        isReady[playerUserToNum[data.id]] = true;
      } else if (data.data == "notready") {
        isReady[playerUserToNum[data.id]] = false;
      }
      //only if admin then start the game.
      if (data.data == "admin") {
        storeMainGame.dispatch(startGameSelect());
      }
    });

    socket.on('sendvote', function (data) {
      console.log('get sendvote ' + data.id);
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
      var username = $.sanityReturnUsername(data.username);
      console.log('user joined: ' + username);
      if (data.username != 'mainclient') {
        var canvasnum = Object.keys(clientdict).length;
        playercount++;
        var playerobj = {};
        playerobj["username"] = username;
        playerobj["isadmin"] = false;
        playerobj["canvasid"] = 'canvas-p' + canvasnum;
        playerobj["playernum"] = canvasnum;
        playerobj["socketid"] = data.id;
        clientdict[data.id] = playerobj;
        //update username to socketid map
        usernameToSocketid[username] = data.id;
        //update playernum to id map
        playernumToUser[canvasnum] = username;
        playerUserToNum[username] = canvasnum;
        socket.emit('update username', {
          username: username,
          client: data.id
        });
        if (canvasnum == 0) {
          clientdict[data.id].isadmin = true;
          //make admin
          socket.emit('makeadmin', {
            message: 'you are admin',
            client: data.id
          });
        }
        log(username + ' joined');
      } else if (username == 'mainclient') {
        $loginPage.fadeOut();
        $chatPage.show();
        //go to lobby page
        console.log('start lobby');
        storeMainGame.dispatch(startLobby());
        log('Main client is ready.');
      }
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', function (data) {
      log(data.username + ' left');
      //clear canvas
      //$.clearSelectedCanvas(data.id);
      //TODO: remove player from dict
      //remove name label by updateing array
      var canvasnum = playerUserToNum[data.username];
      delete playerUserToNum[data.username];
      playernumToUser[canvasnum] = data.username + " left";
    });

    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', function (data) {
      addChatTyping(data);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', function (data) {});

    socket.on('disconnect', function () {
      log('you have been disconnected');
    });

    socket.on('reconnect', function () {
      log('you have been reconnected');
      if (username) {
        socket.emit('add user', username);
      }
    });

    socket.on('user reconnect', function (data) {
      log(data.username + ' reconnected');
      //check if username is a dup/beginning of dup except for last char
      //add N+1 as char ending if found N matches
      //make this reusable function
      //get old socketid
      var oldSocketid = usernameToSocketid[data.username];
      var recoveredplayerObj = clientdict[oldSocketid];
      //update obj
      recoveredplayerObj["socketid"] = data.id;
      clientdict[data.id] = recoveredplayerObj;
      //update username to socketid map
      usernameToSocketid[data.username] = data.id;
      //update playernum to id map
      playernumToUser[recoveredplayerObj.playernum] = data.username;
      playerUserToNum[data.username] = recoveredplayerObj.playernum;
      //make admin
      if (clientdict[data.id].isadmin) {
        //make admin
        socket.emit('makeadmin', {
          message: 'you are now admin',
          client: data.id
        });
      }

      //delete old obj
      delete clients[oldSocketid];
      delete cursors[oldSocketid];
      delete clientdict[oldSocketid];

      //check game then apply handleReconnect of minigame
      if (storeMainGame.getState().gamestate == "minigameone") {
        minigameone.handleReconnect();
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
      cert: fs.readFileSync(certFile),
      key: fs.readFileSync(keyFile),
      passphrase: 'pass',
      ca: fs.readFileSync(caFile),
      json: true // Automatically stringifies the body to JSON

    };
    console.log('getroomcode');
    rp(options).then(function (parsedBody) {
      // POST succeeded...
      console.log('room code: %s', parsedBody);
      //update roomcode
      $('#roomcode span').text(parsedBody);
      connectToSocket(parsedBody);
    }).catch(function (err) {
      // POST failed...
      console.log(err);
    });
  }

  function updateVote(data) {
    //save last vote data
    lastVoteData = data.data;
    //get playerid to num
    votes[playerUserToNum[data.data]]++;
    var num = playerUserToNum[data.id];
    voteData[num] = data.data;
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
      //$loginPage.fadeOut();
      //$chatPage.show();
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