/*jshint esversion: 6 */
const fs = require('fs')
    , path = require('path')
    , certFile = path.resolve(__dirname, 'sslcert/client1-crt.pem')
    , keyFile = path.resolve(__dirname, 'sslcert/client1-key.pem')
    , caFile = path.resolve(__dirname, 'sslcert/ca-crt.pem')
var https = require('https');
import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter,
  HashRouter,
  Route,
  Link,
  Switch,
  withRouter
} from 'react-router-dom';
import {
  Shake,
  ShakeLittle,
  ShakeSlow
} from 'reshake';
import Slider from 'react-slick';
import {MiniGameOneLayout} from './minigameone';
import {GameSelectScreen} from './gameselect';
import * as ReactRedux from 'react-redux';
import * as Redux from 'redux';
import * as minigameone from './minigameone';
import env from './env';

let HOSTNAME = env.serverendpoint;
let PORT = env.serverport;

class LobbyScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {playerlabels: ['Player1 Join', 'Player2 Join',
                                'Player3 Join', 'Player4 Join',
                                'Player5 Join', 'Player6 Join',
                                'Player7 Join', 'Player8 Join'
                              ]};
  }

  componentDidMount() {
    this.interval = setInterval(() => this.startGame(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  //function that is called when admin starts game
  startGame(){
    //update player names
    //TODO: optimize by checking if state has changed first
    for (let key in $.getplayernumToUser()){
      if ($.getplayernumToUser().hasOwnProperty(key)){
        this.state.playerlabels[key] = $.getplayernumToUser()[key];
      }
    }
    this.setState({playerlabels: this.state.playerlabels});
    console.log("in startgame: "+this.props.gamestate);
    if (this.props.gamestate == 'minigameone'){
      if (this.props.history.location.pathname != '/minigameone'){
        $.resetReadyPlayers();
        $.callstatechangeall('msg', 'start rules', 'Press OK to skip rules.');
        minigameone.storeTimer.dispatch(minigameone.startTimer(31));
        minigameone.storeGame.dispatch(minigameone.startIdle());
        this.props.history.push('/minigameone');
      }
    }
    else if (this.props.gamestate == 'lobby'){
      if (this.props.history.location.pathname != '/'){
        this.props.history.push('/');
        $.callstatechangeall('draw', 'Draw something!');
      }
    }
    else if (this.props.gamestate == 'gameselect'){
      if (this.props.history.location.pathname != '/gameselect'){
        this.props.history.push('/gameselect');
      }
    }
    else{
      //do nothing
    }
  }

  render() {
    const canvasitems = this.state.playerlabels.map((playername, index) =>
        <div className="col-sm-3 text-center" key={"canvas-p"+index}>
          <canvas id={"canvas-p"+index} width={"268"} height={"340"}></canvas>
          <br/>
          <div id={"playerlabel"+index}>{this.state.playerlabels[index]}</div>
        </div>

    );
    return (
      <div className="row">
        {canvasitems}
      </div>
    );
  }
}


const initialMainGameState = {
  gamestate: "lobby"
};
//action creators
// Action Creators
function startGame(gamename) {
  console.log("action creator startgame: "+gamename);
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
function maingamereducer(state = initialMainGameState, action) {
  switch (action.type) {
    case "LOBBY":
      return {
        ...state,
        //set new state
        gamestate: 'lobby'
      };
    case "GAMESELECT":
      return {
        ...state,
        gamestate: 'gameselect'
      };
    case "MINIGAMEONE":
      //alert("discuss state");
      return {
        ...state,
        //set new state
        gamestate: 'minigameone'
      };
    default:
      return state;
  }
}

class MainFrame extends React.Component {
  componentDidMount() {
    //this.interval = setInterval(this.forceUpdate.bind(this), 1000);
  }

  componentWillUnmount() {
    //clearInterval(this.interval);
  }

  render() {
    return (
      <HashRouter>
      <div>
          <Route exact path="/" component={LobbyScreen}/>
          <Route path="/minigameone" component={MiniGameOneLayout}/>
          <Route path="/gameselect" component={GameSelectScreen}/>
      </div>
      </HashRouter>
    );
  }
}

class Rules extends React.Component {
  componentDidMount() {
    this.interval = setInterval(() => this.onGameStart(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onGameStart(){
    if (this.props.gamestate == "minigameone"){
      var settings = {
        autoplaySpeed: 10000,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true
      };
      return (
        <Slider {...settings}>
         <div><img src="ruleslides/illuminatiimposterslides1.png" height="100%" width="100%"></img></div>
         <div><img src="ruleslides/illuminatiimposterslides2.png" height="100%" width="100%"></img></div>
         <div><img src="ruleslides/illuminatiimposterslides3.png" height="100%" width="100%"></img></div>
       </Slider>
      );
    }
    else {
      return (
        <div>{"No rules to display here"}</div>
      );
    }
  }

  render() {
    return (
      <div>
        {this.onGameStart()}
      </div>
    );
  }
}

function mapStateToPropsMainFrame(state) {
  return { gamestate: state.gamestate
         };
}
function mapStateToPropsRules(state) {
  return { gamestate: state.gamestate
         };
}
MainFrame = ReactRedux.connect(mapStateToPropsMainFrame, { startGame, startLobby })(MainFrame);
LobbyScreen = withRouter(ReactRedux.connect(mapStateToPropsMainFrame)(LobbyScreen));
Rules = ReactRedux.connect(mapStateToPropsRules)(Rules);

const storeMainGame = Redux.createStore(maingamereducer);

ReactDOM.render(
    <ReactRedux.Provider store={storeMainGame}>
      <MainFrame />
    </ReactRedux.Provider>,  document.getElementById('mainframe'));

ReactDOM.render(
    <div className="title">HappyDraw</div>
,  document.getElementById('happydrawtitle'));

ReactDOM.render(
    <ReactRedux.Provider store={storeMainGame}>
      <Rules />
    </ReactRedux.Provider>,  document.getElementById('rules'));

$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#DC4c46', '#4f84c4', '#d8ae47', '#ce3175',
    '#005960', '#e15d44', '#b565a7', '#000',
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
  let votes = [0,0,0,0,0,0,0,0,0,0,0,0];
  let isReady = [false, false, false, false, false, false, false, false, false ,false];
  let voteData = ['','','','','','','','','','','',''];
  let playernumToUser = {};
  let playerUserToNum = {};
  let usernameToSocketid = {};
  let playercount = 0;
  let clientsDrawpoints = {};
  let lastVoteData;
  var socket;

  //helper gamestate functions
  $.changeGameState = function(gamename){
    console.log("try to change game:" + gamename);
    storeMainGame.dispatch(startGame(gamename));
  }

  $.changeToLobby = function(){
    storeMainGame.dispatch(startLobby());
  }

  //helper socket functions
  $.sendGameState = function(gamestate){
    socket.emit('changegame',{
      message: 'changing gamestate of mainclient',
      game: gamestate
    })
  }

  $.callstatechangeall = function(mode, msg = "", payload = ""){
    socket.emit('changestateall',{
      state: mode,
      message: msg,
      payload: payload
    })
  };

  $.callstatechangeprivate = function(mode, msg = "", clientid, payload = ""){
    socket.emit('changestateprivate',{
      state: mode,
      message: msg,
      payload: payload,
      client: clientid
    })
  };

  $.clearAllCanvas = function() {
    $.each( $('canvas'), function(index, canvas){
      let context = canvas.getContext('2d');
      context.clearRect(0,0, canvas.width, canvas.height);
    })
  };

  //takes player socketid and clears the canvas
  //TODO: not working
  $.clearSelectedCanvas = function(playerid) {
    let canvas = $('#'+clientdict[playerid].canvasid);
    let context = canvas[0].getContext('2d');
    context.clearRect(0,0, canvas.width, canvas.height);
  };

  $.getAllCanvas = function() {
    let canvasarray = [];
    $.each( $('canvas'), function(index, canvas){
      canvasarray[index] = canvas;
    })
    return canvasarray;
  };

  $.getplayernumToUser = function(){
    return playernumToUser;
  }

  $.getPlayernumById = function(username){
    return playerUserToNum[username];
  }

  //return all players
  $.returnAllPlayers = function() {
    return clientdict;
  };

  //get sendbutton counter for num of palyers rdy
  $.isReadyPlayers = function(){
    for (let i=0;i<playercount;i++){
      if (isReady[i] == false){
        return false;
      }
    }
    return true;
  }

  $.isReadyPlayerId = function(id){
    return isReady[playerUserToNum[id]];
  }


  $.isReadyPlayerNum = function(num){
    return isReady[num];
  }

  $.resetReadyPlayers = function(){
    for (let i=0;i<playercount;i++){
      isReady[i] = false;
    }
  }

  $.resetLastVoteData = function(){
    lastVoteData = null;
  }

  //clear votes
  $.resetVotes = function() {
    for (let i=0;i<votes.length;i++){
      votes[i] = 0;
      voteData[i] = 0;
    }
  }

  $.retlastVote = function() {
    return lastVoteData;
  };

  $.retVoteData = function() {
    return voteData;
  };

  $.retVotes = function() {
    return votes;
  };

  /*this function will return the username if no duplicates exists
  if a duplicate exists then it will return the username with a number appended
  where the number is N+1 with N duplicate occurances found.
  */
  $.sanityReturnUsername = function(username){
    let duplicateCount = 1;
    for (let key in clientdict){
      if (clientdict.hasOwnProperty(key)){
        let playerobj = clientdict[key];
        if ((username === playerobj.username) || (username === playerobj.username.slice(0,playerobj.username.length-1))){
          duplicateCount++;
        }
      }
    }
    if (duplicateCount > 1){
      return username+duplicateCount.toString();
    }
    else {
      return username;
    }

  }

  function drawLine(fromx, fromy, tox, toy, playerid) {
    const drawcanvas = $('#'+clientdict[playerid].canvasid);
    const ctxdrawcanvas = drawcanvas[0].getContext('2d');
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

  function drawDot(fromx, fromy, playerid){
    const drawcanvas = $('#'+clientdict[playerid].canvasid);
    const ctxdrawcanvas = drawcanvas[0].getContext('2d');
    ctxdrawcanvas.fillStyle = COLORS[clientdict[playerid].playernum];
    ctxdrawcanvas.beginPath();
    ctxdrawcanvas.arc(fromx, fromy, ctxdrawcanvas.lineWidth / 2, 0, Math.PI * 2, !0);
    ctxdrawcanvas.fill();
    ctxdrawcanvas.closePath();
  }

  function drawLineQuad(fromx, fromy, playerid) {
    const drawcanvas = $('#'+clientdict[playerid].canvasid);
    const ctxdrawcanvas = drawcanvas[0].getContext('2d');
    //define drawing settings
    ctxdrawcanvas.lineWidth = 4;
    ctxdrawcanvas.lineJoin = 'round';
    ctxdrawcanvas.lineCap = 'round';

    //draw dots
    if ((pointsarray.length > 0) && (pointsarray.length < 3))  {
      let b = pointsarray[0];
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

  function connectToSocket(roomCode){
     //process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
     https.globalAgent.options.rejectUnauthorized = false;
     socket = require('socket.io-client')('http://' + HOSTNAME + ':'+ PORT +'/'+roomCode);
     console.log('try: %s', 'http://' + HOSTNAME + ':'+ PORT +'/'+roomCode);
     defineSocket();
     log('Room Code: '+roomCode, {
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
        //create drawpoints array for new user
        clientsDrawpoints[data.id] = [];
        //TODO: cleanup if user leaves
      }

      // Is the user drawing?
      if ((data.drawing == true) && (clients[data.id])) {
        // Draw a line on the canvas. clients[data.id] holds
        // the previous position of this user's mouse pointer
        //update drawing points for client
        //if array points is greater than 3 then trim it
        if (clientsDrawpoints[data.id].length > 3){
          clientsDrawpoints[data.id].shift();
        }
        clientsDrawpoints[data.id].push({x:data.x, y:data.y});
        //drawLineQuad(clientsDrawpoints[data.id], data.id);
        drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y, data.id);
      }
      // Saving the current client state
      clients[data.id] = data;
      clients[data.id].updated = $.now();
    });

    socket.on('pendown', function(data) {
      if (!(data.id in clients)) {
        // a new user has come online. create a cursor for them
        cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
        //create drawpoints array for new user
        clientsDrawpoints[data.id] = [];
        //TODO: cleanup if user leaves
      }
      //reset drawing points array
      clientsDrawpoints[data.id].length = 0;
      if ((data.drawing == true) && (clients[data.id])) {
        clientsDrawpoints[data.id].push({x:data.x, y:data.y});
      }
      // Saving the current client state
      clients[data.id] = data;
      clients[data.id].updated = $.now();
    });

    socket.on('penup', function(data) {
      //drawLineQuad(clientsDrawpoints[data.id], data.id);
      clientsDrawpoints[data.id] = [];
      // Saving the current client state
      clients[data.id] = data;
      clients[data.id].updated = $.now();
    });

    socket.on('drawdot', function(data) {
      drawDot(data.x, data.y, data.id);
      clientsDrawpoints[data.id] = [];
      // Saving the current client state
      clients[data.id] = data;
      clients[data.id].updated = $.now();
    });

    // Whenever the server emits 'sendbutton'
    socket.on('sendbutton', function (data) {
      if (data.data=="ready"){
        isReady[playerUserToNum[data.id]] = true;
      }
      else if (data.data=="notready"){
        isReady[playerUserToNum[data.id]] = false;
      }
      //only if admin then start the game.
      if (data.data == "admin"){
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
      let username = $.sanityReturnUsername(data.username);
      console.log('user joined: '+username);
      if (data.username != 'mainclient'){
        let canvasnum = Object.keys(clientdict).length;
        playercount++;
        const playerobj = {};
        playerobj["username"] = username;
        playerobj["isadmin"] = false;
        playerobj["canvasid"] = 'canvas-p'+canvasnum;
        playerobj["playernum"] = canvasnum;
        playerobj["socketid"] = data.id;
        clientdict[data.id] = playerobj;
        //update username to socketid map
        usernameToSocketid[username] = data.id;
        //update playernum to id map
        playernumToUser[canvasnum] = username;
        playerUserToNum[username] = canvasnum;
        socket.emit('update username',{
          username: username,
          client: data.id
        })
        if (canvasnum == 0){
          clientdict[data.id].isadmin = true;
          //make admin
          socket.emit('makeadmin',{
            message: 'you are admin',
            client: data.id
          })
        }
        log(username + ' joined');
      }
      else if (username == 'mainclient'){
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
      let canvasnum = playerUserToNum[data.username];
      delete playerUserToNum[data.username];
      playernumToUser[canvasnum] = data.username + " left";
    });

    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', function (data) {
      addChatTyping(data);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', function (data) {
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

    socket.on('user reconnect', function (data) {
      log(data.username + ' reconnected');
      //check if username is a dup/beginning of dup except for last char
      //add N+1 as char ending if found N matches
      //make this reusable function
      //get old socketid
      let oldSocketid = usernameToSocketid[data.username];
      let recoveredplayerObj = clientdict[oldSocketid];
      //update obj
      recoveredplayerObj["socketid"] = data.id;
      clientdict[data.id] = recoveredplayerObj;
      //update username to socketid map
      usernameToSocketid[data.username] = data.id;
      //update playernum to id map
      playernumToUser[recoveredplayerObj.playernum] = data.username;
      playerUserToNum[data.username] = recoveredplayerObj.playernum;
      //make admin
      if (clientdict[data.id].isadmin){
        //make admin
        socket.emit('makeadmin',{
          message: 'you are now admin',
          client: data.id
        })
      }

      //delete old obj
      delete clients[oldSocketid];
      delete cursors[oldSocketid];
      delete clientdict[oldSocketid];

      //check game then apply handleReconnect of minigame
      if (storeMainGame.getState().gamestate == "minigameone"){
        minigameone.handleReconnect();
      }
    });

    socket.on('reconnect_error', function () {
      log('attempt to reconnect has failed');
    });
  }

  function getRoomCode(){
    var rp = require('request-promise');
    console.log('request to : '+'http://' + HOSTNAME + ':'+ PORT +'/createRoom')
    var options = {
        method: 'POST',
        uri: 'http://' + HOSTNAME + ':'+ PORT +'/createRoom',//'http://ec2-13-59-140-62.us-east-2.compute.amazonaws.com/createRoom',
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
    rp(options)
        .then(function (parsedBody) {
            // POST succeeded...
            console.log('room code: %s', parsedBody);
            //update roomcode
            $('#roomcode span').text(parsedBody);
            connectToSocket(parsedBody);
        })
        .catch(function (err) {
            // POST failed...
            console.log(err);
        });

  }

  function updateVote(data){
    //save last vote data
    lastVoteData = data.data;
    //get playerid to num
    votes[playerUserToNum[data.data]]++;
    let num = playerUserToNum[data.id];
    voteData[num] = data.data;

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
      //$loginPage.fadeOut();
      //$chatPage.show();
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
