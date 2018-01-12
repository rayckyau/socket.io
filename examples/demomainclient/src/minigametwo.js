/*jshint esversion: 6 */
import * as ReactRedux from 'react-redux';
import * as Redux from 'redux';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Link,
  withRouter
} from 'react-router-dom'
import CountUp, { startAnimation } from 'react-countup';

const TIMELIMIT_DRAW = 8;
const TIMELIMIT_BEGIN = 10;
const TIMELIMIT_END = 10;

let ISNAVOPEN = false;
let NAVTIMER;

let WORDLIST = ['dog','cat','cow','mouse','elephant'];

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}


//TIMER OBJ
// Action Creators
export function startTimer(baseTime) {
  return {
    type: "START_TIMER",
    baseTime: baseTime,
    now: new Date().getTime()
  };
}

function stopTimer() {
  return {
    type: "STOP_TIMER",
    now: new Date().getTime()
  };
}

function resetTimer(restime) {
  return {
    type: "RESET_TIMER",
    baseTime: restime,
    now: new Date().getTime()
  }
}

// TIMER Reducer / Store
const initialTimerState = {
  startedAt: new Date().getTime(),
  stoppedAt: new Date().getTime(),
  baseTime: 10
};

function timerreducer(state = initialTimerState, action) {
  switch (action.type) {
    case "RESET_TIMER":
      return {
        ...state.timerreducer,
        baseTime: action.baseTime,
        startedAt: state.startedAt ? action.now : undefined,
        stoppedAt: state.stoppedAt ? action.now : undefined
      };
    case "START_TIMER":
      return {
        ...state.timerreducer,
        baseTime: action.baseTime,
        startedAt: action.now,
        stoppedAt: undefined
      };
    case "STOP_TIMER":
      return {
        ...state.timerreducer,
        stoppedAt: action.now
      }
    default:
      return state;
  }
}

// Helper function that takes store state
// and returns the current elapsed time
function getElapsedTime(baseTime, startedAt, stoppedAt = new Date().getTime()) {
  if (!startedAt) {
    return baseTime;
  } else {
    return baseTime - (stoppedAt - startedAt)/1000;
  }
}

// TIMER COMPONENT
class Timer extends React.Component {
  constructor(props){
    super(props);
  }

  componentDidMount() {
    this.interval = setInterval(this.forceUpdate.bind(this), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  checkStop(timeleft){
    let mystate = storeGame.getState();
    /*
    playernames[playerobj.playernum] = playerobj.username;
    playersockets[playerobj.playernum] = playerobj.socketid;
    */
    if (timeleft <= 0){
      $.resetReadyPlayers();
      storeTimer.dispatch(stopTimer());

      if (mystate.gamestate ==  "DRAW"){
        let canvases = $.getAllCanvas();
        playersave.push(canvases[0].toDataURL());
        //cut off previous player with msg state
        if (mystate.loopcounter != 0){
          let socketPreviousPlayer = playersockets[playerturnorder[mystate.loopcounter-1]];
          $.callstatechangeprivate("msg", "Time's up!", socketPreviousPlayer , "Passing on the baton!");
        }
        //find next player from turn order
        //give player draw and secret word
        let socketPlayer = playersockets[playerturnorder[mystate.loopcounter]];
        $.callstatechangeprivate("draw", "Secret Word: " + secretWord, socketPlayer , playersave[mystate.loopcounter-1]);
        console.log('canvas url: '+playersave[mystate.loopcounter-1]);
        //warn player unless guesser
        if (mystate.loopcounter != playerturnorder.length-1){
          //warn next player
          let nextPlayer = playersockets[playerturnorder[mystate.loopcounter+1]];
          $.callstatechangeprivate("msg", "Your turn is coming up!", nextPlayer , "Get ready to draw!");
          storeTimer.dispatch(startTimer(TIMELIMIT_DRAW));
          storeGame.dispatch(startDraw());
        }

        if (mystate.loopcounter == playerturnorder.length-1){
          //warn next player
          let nextPlayer = playersockets[playerturnorder[mystate.loopcounter+1]];
          $.callstatechangeprivate("msg", "Your turn is coming up!", nextPlayer , "Get ready to guess!");
          storeTimer.dispatch(startTimer(TIMELIMIT_BEGIN));
          storeGame.dispatch(startGuess());
        }

      }
      else if (mystate.gamestate ==  "GAMERECAP"){
        if ($.retlastVote() == "Back To Lobby"){
          storeGame.dispatch(startExit());
        }
        else{
          setupGame();
          storeTimer.dispatch(startTimer(TIMELIMIT_BEGIN));
          storeGame.dispatch(startBegin());
        }
      }
      else if (mystate.gamestate ==  "IDLE"){
        setupGame();
        $.callstatechangeall('msg', "Wait your turn", "Get Ready!");
        storeTimer.dispatch(startTimer(TIMELIMIT_BEGIN));
        storeGame.dispatch(startBegin());
        //find starting player and give them secret word
        let socketPlayer = playersockets[playerturnorder[mystate.loopcounter]];
        $.callstatechangeprivate("msg", "Secret Word: " + secretWord, socketPlayer , "Get ready to draw!");
        $.callstatechangeprivate("msg", "You are the guesser!", socketGuesser , "Guess the drawing when it is your turn!");
      }
      else if (mystate.gamestate ==  "BEGIN"){
        storeTimer.dispatch(startTimer(TIMELIMIT_DRAW));
        storeGame.dispatch(startDraw());
        //find starting player and give draw state
        let socketPlayer = playersockets[playerturnorder[mystate.loopcounter]];
        $.callstatechangeprivate("draw", "Secret Word: " + secretWord, socketPlayer , "Get ready to draw!");
        //warn next player
        let nextPlayer = playersockets[playerturnorder[mystate.loopcounter+1]];
        $.callstatechangeprivate("msg", "Secret Word: " + secretWord, nextPlayer , "Get ready to draw!");
      }
      else if (mystate.gamestate ==  "END"){
        $.clearAllCanvas();
        storeTimer.dispatch(resetTimer(99));
        storeGame.dispatch(startGameRecap());
        $.callstatechangeall('msg', 'Game Recap', 'Check out the main screen for a recap of the game. Press OK to keep playing!');
        $.callstatechangeprivate("vote", "Keep playing?", socketGuesser , "Keep playing,Back To Lobby");
      }
      else{
        //error state
      }
      timeleft = 0;
    }
    else{
      //do nothing

    }
      return timeleft;
  }


  render() {
    const { baseTime, startedAt, stoppedAt } = this.props;
    const elapsed = getElapsedTime(baseTime, startedAt, stoppedAt);
    let options = {
                strokeWidth: 4,
                color: '#000'
            };
    let containerStyle = {
        width: '100px',
        height: '100px'
    };
    let roundedTime = Math.round(elapsed);
    let mystate = storeTimer.getState();
    return (
      <div className="Timer">
      <div className="timerbar">{Math.max(0,(parseInt((this.checkStop(roundedTime)-1)) || 0))}</div>
        <div className="debug">
          <button onClick={() => storeTimer.dispatch(startTimer(3))}>start</button>
          <button onClick={() => storeTimer.dispatch(stopTimer())}>stop</button>
          <button onClick={() => storeTimer.dispatch(resetTimer(3))}>res</button>
        </div>
      </div>
    );
  }
}

function mapStateToPropsTimer(state) {
  const { baseTime, startedAt, stoppedAt } = state;
  return { baseTime, startedAt, stoppedAt };
}
//END TIMER COMPONENT

//MINIGAME REDUX
const initialGameState = {
  gamestate: "IDLE",
  loopcounter: 0,
  winner: "",
  words: []
};

//action creators
export function startIdle() {
  return {
    type: "IDLE",
    gamestate: "IDLE",
    winner: ""
  };
}
function startBegin() {
  return {
    type: "BEGIN",
    gamestate: "BEGIN",
    winner: "",
    words: words
  };
}
function startDraw() {
  return {
    type: "DRAW",
    gamestate: "DRAW"
  };
}
function startGuess() {
  return {
    type: "GUESS",
    gamestate: "GUESS"
  };
}
function startGameRecap() {
  return {
    type: "GAMERECAP",
    gamestate: "GAMERECAP"
  };
}
function startEnd(winner) {
  return {
    type: "END",
    gamestate: "END",
    winner: winner
  };
}
function startExit() {
  return {
    type: "EXIT",
    gamestate: "EXIT"
  };
}

//reducer
function minigametworeducer(state = initialGameState, action) {
  switch (action.type) {
    case "IDLE":
      return {
        ...state,
        //set new state
        gamestate: action.gamestate,
        loopcounter: state.loopcounter,
        winner: action.winner,
        words: state.words
      };
    case "DRAW":
      return {
        ...state,
        //set new state
        gamestate: action.gamestate,
        loopcounter: state.loopcounter+1,
        winner: state.winner,
        words: state.words
      };
    case "GUESS":
      return {
        ...state,
        //set new state
        gamestate: action.gamestate,
        loopcounter: state.loopcounter+1,
        winner: state.winner,
        words: state.words
      };
    case "GAMERECAP":
      return {
        ...state,
        //set new state
        gamestate: action.gamestate,
        loopcounter: state.loopcounter,
        winner: state.winner,
        words: state.words
      }
    case "END":
        //animate winner or loser
      return {
        ...state,
        gamestate: action.gamestate,
        loopcounter: 0,
        winner: action.winner,
        words: state.words
      }
    case "BEGIN":
        //rules stuff
      return {
        ...state,
        gamestate: action.gamestate,
        loopcounter: 0,
        winner: state.winner,
        words: action.words
      }
    case "IDLE":
        //wait
      return {
        ...state,
        gamestate: action.gamestate,
        loopcounter: 0,
        winner: action.winner,
        words: state.words
    }
    case "EXIT":
      return {
        state: undefined,
        gamestate: 'EXIT',
        loopcounter: 0,
        winner: '',
        words: []
    }
    default:
      return state;
  }
}

class MiniGameTwo extends React.Component {
  constructor(props){
    super(props);
  }

  returnGameState(gamestatelabel){
    if (gamestatelabel == "BEGIN"){
      return "Begin"
    }
    else if (gamestatelabel == "END"){
      return "End"
    }
    else if (gamestatelabel == "DRAW"){
      return "Draw"
    }
    else if (gamestatelabel == "GUESS"){
      return "Guess"
    }
    else if (gamestatelabel == "GAMERECAP"){
      return "Recap"
    }
    else {
      return gamestatelabel;
    }
  }

  returnRoundCounter(roundCounter){
    //replace this with player name

    if (roundCounter === 0){
      return ""
    }
    else if (roundCounter === 1){
      return "Round 1";
    }
    else if (roundCounter === 2){
      return "Round 2";
    }
    else {
      return "Round 0"
    }
  }


  render() {
    const gamestatelabel = this.props.gamestate;
    const loop = this.props.loopcounter;
    const words = this.props.words;
    return (
      <div>
        <div id="gamestatelabel">{this.returnGameState(gamestatelabel)}</div>
        <div id="roundcounter">{this.returnRoundCounter(this.props.loopcounter)} </div>
        <div className="col">
          <WordList words={this.props.words} />
        </div>
      </div>
    );
  }
}

function mapStateToPropsGameTwo(state) {
  return { gamestate: state.gamestate,
           loopcounter: state.loopcounter,
           winner: state.winner,
           words: state.words
         };
}
//END MINIGAME REDUX

//bind state to props
Timer = ReactRedux.connect(mapStateToPropsTimer, { startTimer, stopTimer, resetTimer })(Timer);
MiniGameTwo = ReactRedux.connect(mapStateToPropsGameTwo, { startDraw, startBegin, startIdle, startGuess})(MiniGameTwo);

//add reducers to stores
//const rootReducer = combineReducers({timerreducer, minigameonereducer});
export const storeTimer = Redux.createStore(timerreducer);
export const storeGame = Redux.createStore(minigametworeducer);

//WORDLIST REACT
function WordList(props) {
  let wordsInWordList = props.words;
  const listItems = wordsInWordList.map((word, index) =>
    <div key={"word"+index} className="wordminigameone" disabled>{word}</div>
  );
  return (
      <div className="WordList">{listItems}</div>
  );
}
//END WORDLIST REACT


//MINIGAME LAYOUT
export class MiniGameTwoLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {gamestate: "IDLE", playerreadylabels: playerready};
  }

  componentDidMount() {
    this.interval = setInterval(() => this.checkGameState(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  checkGameState(){
    for (let i=0;i<8;i++){
      playerready[i] = $.isReadyPlayerNum(i);
    }

    this.setState({gamestate:storeGame.getState().gamestate, playerreadylabels: playerready});

    if (storeGame.getState().gamestate == "EXIT"){
      $.resetVotes();
      $.resetLastVoteData();
      $.changeToLobby();
      $.callstatechangeall('draw', 'Draw something!');
      this.props.history.push('/');
    }
  }

  displayPage(gamestate){

    const canvasitems = playernames.map((playername, index) => {
      let mystyle = {position: 'absolute'};
      if (this.state.playerreadylabels[index] == true){
        mystyle = {position: 'absolute', color: 'green'};
      }else{
        mystyle = {position: 'absolute', color: 'black'};
      }
      return(
        <div className="col-sm-3 text-center" key={'canvasitem'+index}>
          <div id="cf">
            <img className="bottom" src={playersave[index]} width={"214"} height={"268"}/>
            <img className="top" src={playersave[index]} width={"214"} height={"268"}/>
          </div>
          <div id="playerlabel" style={mystyle}>{playernames[index]}</div>
        </div>
      );
    });


    if (gamestate == 'GAMERECAP'){
      return (
        <div className="col-sm-10 rightpanel">
          <div className="container">
          <div className="row justify-content-md-center">
            {canvasitems}
          </div>
          </div>
        </div>

      )
    }
    else if (gamestate == 'END'){
      let winPhrase = "";
      return (
        <div className="col-sm-10 rightpanel">
          <div className="container">
          <div className="row justify-content-md-center announce">
            The winner is...
          </div>
          <div className="row justify-content-md-center winner">
            {winPhrase}
          </div>
          </div>
        </div>

      )
    }
    else if (gamestate == 'BEGIN'){
      if (ISNAVOPEN == true){
        closeNav();
      }
      return (
        <div className="col-sm-10 rightpanel">
          <div className="container">
            <div className="row justify-content-md-center announce">
              The roles have been given out. Look at your device!
            </div>
          </div>
        </div>

      )
    }
    else if (gamestate == 'IDLE'){
      if (ISNAVOPEN == false){
        openNav();
      }
      return (
        <CanvasLayout />
      )
    }
    else{
      return (
        <CanvasLayout />
      )
    }
  }

  render() {
    return (
      <div className="container-fluid minigameone">
         <div className="row justify-content-md-center">
          <div className="col-sm-2">
             <ReactRedux.Provider store={storeGame}>
              <MiniGameTwo />
             </ReactRedux.Provider>
             <ReactRedux.Provider store={storeTimer}>
              <Timer updateInterval={1000} />
             </ReactRedux.Provider>
          </div>
          {this.displayPage(this.state.gamestate)}
         </div>
      </div>
    );
  }
}

export class CanvasLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {playerlabels: playernames, playerreadylabels: playerready};
  }

  componentDidMount() {
    this.interval = setInterval(() => this.updateNames(), 2000);

  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  updateNames() {
    //TODO: optimize by checking if state has changed first
    for (let i=0;i<8;i++){
      playerready[i] = $.isReadyPlayerNum(i);
    }

    this.setState({playerlabels: playernames, playerreadylabels: playerready});
  }

  render() {

    const canvasitems = playernames.map((playername, index) => {
        let mystyle = {color: 'black'};
        if (this.state.playerreadylabels[index] == true){
          mystyle = {color: 'green'};
        }
        return(
          <div className="col-sm-3 text-center canvasSection" key={"canvas-p"+index}>
              <canvas id={"canvas-p"+index} width={"214"} height={"268"}></canvas>
              <div id="playerlabel" style={mystyle}>{this.state.playerlabels[index]}</div>
          </div>
        );
    });
    return (
      <div className="col-sm-10 rightpanel">
        <div className="container">
        <div className="row justify-content-md-center">
          {canvasitems}
          </div>
        </div>
      </div>

    )
  }
}


let words = [];
let playernames = [];
let playerready = [];
let playerpoints = [0,0,0,0,0,0,0,0];
let playersockets = [];
let playersave = [];
let playerturnorder = [];
let secretWord;
let socketGuesser;
let winner;
let guessernum;

function openNav() {
    console.log("opennav gametwo");
    ISNAVOPEN = true;
    document.getElementById("rules").style.height = "100%";
}
function closeNav() {
    console.log("closenav gametwo");
    ISNAVOPEN = false;
    document.getElementById("rules").style.height = "0%";
    clearTimeout(NAVTIMER);
}

export function handleReconnect(){
  console.log("handle reconnect minigametwo");
  //verify/update all playersockets
  let clientsobj = $.returnAllPlayers();

  for (let key in clientsobj){
    if (clientsobj.hasOwnProperty(key)){
      let playerobj = clientsobj[key];
      playernames[playerobj.playernum] = playerobj.username;
      playersockets[playerobj.playernum] = playerobj.socketid;
      if (playerobj.playernum == guessernum){
        socketGuesser = playerobj.socketid;
      }
    }
  }
}

function setupTurnOrder(nump){
  //swap 2 random spaces a few times
  for (let i=0;i<5;i++){
    let spotone = Math.floor(Math.random()*(nump-1));
    let spottwo = Math.floor(Math.random()*(nump-1));
    let tmp = playerturnorder[spotone];
    playerturnorder[spotone] = playerturnorder[spottwo];
    playerturnorder[spottwo] = tmp;
  }
  //append final player guesser
  playerturnorder.push(guessernum);
  console.log(playerturnorder);
}

function setupGame(){
  $.resetReadyPlayers();
  console.log("setup the minigametwo");
  let clientsobj = $.returnAllPlayers();
  let numplayers = Object.keys(clientsobj).length;
  //setup variables for minigametwo here
  //pick guesser
  //pick rand number, that num is gueser
  guessernum = Math.floor(Math.random()*numplayers);
  //find word from wordlist
  secretWord = WORDLIST[Math.floor(Math.random()*WORDLIST.length)];
  //FOR LOOP
  let counter = 0;
  for (let key in clientsobj){
    if (clientsobj.hasOwnProperty(key)){
      let playerobj = clientsobj[key];
      //add player names into an array
      playernames[playerobj.playernum] = playerobj.username;
      playersockets[playerobj.playernum] = playerobj.socketid;

      if (counter != guessernum){
        playerturnorder.push(playerobj.playernum);
      }
      else {
        //reuse variable and store actual playerobj num
        guessernum = playerobj.playernum;
      }

      counter++;
    }
  }
  //end for loop players
  //populate player turns here
  setupTurnOrder(numplayers);
}
