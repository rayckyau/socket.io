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

const TIMELIMIT_DRAW = 45;
const TIMELIMIT_VOTE = 15;
const TIMELIMIT_DISCUSS = 10;
const TIMELIMIT_BEGIN = 10;
const TIMELIMIT_END = 5;
const TIMELIMIT_CONT = 3;

const PLACEBUCKETNUM = 2;
const PLACEPERBUCKET = 3;
const BUCKETS = 5;

const placebuckets = [];
const helperbuckets = [];
const whichbuckets = [];

//modern city
placebuckets[0] = [
"Paris",
"New York City",
"Toronto",
"London",
"California"];

helperbuckets[0] = [
"modern city",
"roads",
"subway"
];

//exotic place
placebuckets[1] = [
"Japan",
"Shanghai",
"Afghanistan",
"Egypt",
"Australia"];

helperbuckets[1] = [
"exotic place"
];

//mountainous
placebuckets[2] = [
"Machu Pichu",
"Mount Everest",
"Middle Earth",
"Stonehenge",
"Las Vegas",
"Hawaii"
]

helperbuckets[2] = [
"mountain",
"rocks"
];

//water based
placebuckets[3] = [
"Beach",
"Aquarium",
"Deserted Island",
"Atlantis"
]

helperbuckets[3] = [
"water",
"rubber ducky"
];

//sitting places
placebuckets[4] = [
"The Mall",
"Conference Room",
"Soccer Stadium",
"Coffee Shop"
]

helperbuckets[1] = [
"a person sitting",
"a conversation"
];

//standing
placebuckets[5] = [
"Art Gallery",
"Museum",
"Medieval Castle",
"Ancient China",
"Rome"
]

helperbuckets[5] = [
"a person standing",
"picture frame"
];

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

function populatewordarray(){

  let retarraycount = 0;
  let bucketcount = 0;
  let retarray = [];
  //choose a randombucket not in whichbuckets
  let counter = 0;
  let randobucket = 0;
  whichbuckets.length = 0;

  while (whichbuckets.length != PLACEBUCKETNUM){
    console.log(whichbuckets.length);
    randobucket = Math.floor(Math.random() * BUCKETS);
    while (!contains(whichbuckets, randobucket)){
      for (let i=0;i<PLACEPERBUCKET;i++){
        let randword = placebuckets[randobucket][Math.floor(Math.random() * placebuckets[randobucket].length)];
        while (contains(retarray, randword)){
          randword = placebuckets[randobucket][Math.floor(Math.random() * placebuckets[randobucket].length)];
        }
        retarray[retarraycount] = randword;
        retarraycount = retarraycount+1;

      }
      whichbuckets[bucketcount] = randobucket;
      bucketcount++;
    }

  }
  //returns array of words
  return retarray;
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
  componentDidMount() {
    this.interval = setInterval(this.forceUpdate.bind(this), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  checkStop(timeleft){
    let mystate = storeGame.getState();

    //when counting if vote state is spyredeem and a vote is in
    //we can skip straight to next state
    if (mystate.gamestate == "VOTESPY"){
      let votedLoc = $.retDataVote();
      if (votedLoc != null){
        $.callstatechangeall('msg', null, "All votes are in");
        timeleft = 0;
      }
    }
    else if (mystate.gamestate == "VOTE"){
      //if the number of votes is equal to num of players
      //we can skip to next state
      if ($.isAllVoted()){
        $.callstatechangeall('msg', null, "All votes are in");
        timeleft = 0;
      }
    }
    else {
      if ($.isReadyPlayers()){
        $.callstatechangeall('msg', null, "Everyone is ready");
        timeleft = 0;
      }
    }

    if (timeleft <= 0){
      $.resetReadyPlayers();
      if (mystate.gamestate ==  "DRAW"){
          storeTimer.dispatch(stopTimer());
          storeTimer.dispatch(resetTimer(TIMELIMIT_DISCUSS));
          storeTimer.dispatch(startTimer(TIMELIMIT_DISCUSS));
          storeGame.dispatch(startDiscuss());
          $.callstatechangeall('msg', null, "main msg: think");
      }
      else if (mystate.gamestate ==  "DISCUSS"){
          storeTimer.dispatch(stopTimer());
          if (mystate.loopcounter == 2){
            storeTimer.dispatch(resetTimer(TIMELIMIT_VOTE));
            storeTimer.dispatch(startTimer(TIMELIMIT_VOTE));
            $.resetVotes();
            $.resetLastVoteData();
            storeGame.dispatch(startVote());
            //for all players
            for (let i=0;i<playernames.length;i++){
              let newvotestring = playernames.join().replace(playernames[i],'');
              newvotestring = newvotestring.replace(/(^,)|(,$)/g,'').replace(/(,\s*$)|(^,*)/,'');
              console.log(newvotestring);
              $.callstatechangeprivate('vote', "vote for liar", playersockets[i], newvotestring);
            }
          }
          else{
            storeGame.dispatch(startDraw());
            $.clearAllCanvas();
            storeTimer.dispatch(resetTimer(TIMELIMIT_DRAW));
            storeTimer.dispatch(startTimer(TIMELIMIT_DRAW));
            $.callstatechangeall('draw', null);
          }
      }
      else if (mystate.gamestate ==  "VOTE"){
          storeTimer.dispatch(stopTimer());
          //call returnMajorityVote function to get result
          let majvote = $.retMajorityVote();
          console.log("majvote: " + majvote);
          //reveal winner
          if (majvote == -1){
            //make winner the spy
            storeGame.dispatch(startEnd("liar"));
            $.callstatechangeall('msg');
          }else{
            console.log("spy redeem chance");
            $.resetVotes();
            $.resetLastVoteData();
            //if spy is chosen move into new mode only for spy
            $.callstatechangeprivate("vote", "choose the location", socketLiar , words.join())
            storeGame.dispatch(startVoteSpy());
          }
          storeTimer.dispatch(resetTimer(TIMELIMIT_VOTE));
          storeTimer.dispatch(startTimer(TIMELIMIT_VOTE));
      }
      else if (mystate.gamestate ==  "VOTESPY"){
          //call returnDataVote function to get result
          let votedLoc = $.retDataVote();
          let winner = "";
          console.log("voted: " + votedLoc + "secret: "+words[secretPlace])
          //if data is the same as target location spy wins, else spy loses
          if (votedLoc == words[secretPlace]){
            //spy wins
            winner = "liar";
            storeGame.dispatch(startEnd(winner));
          }
          else{
            winner = "everyone else";
            storeGame.dispatch(startEnd(winner));
          }
          storeTimer.dispatch(stopTimer());
          storeTimer.dispatch(resetTimer(TIMELIMIT_END));
          storeTimer.dispatch(startTimer(TIMELIMIT_END));
          $.callstatechangeall('winner is '+ winner);
      }
      else if (mystate.gamestate ==  "IDLE"){
          setupGame();
          storeTimer.dispatch(stopTimer());
          storeTimer.dispatch(resetTimer(TIMELIMIT_BEGIN));
          storeTimer.dispatch(startTimer(TIMELIMIT_BEGIN));
          storeGame.dispatch(startBegin());
      }
      else if (mystate.gamestate ==  "BEGIN"){
          storeTimer.dispatch(stopTimer());
          storeTimer.dispatch(resetTimer(TIMELIMIT_DRAW));
          storeTimer.dispatch(startTimer(TIMELIMIT_DRAW));
          storeGame.dispatch(startDraw());
          $.callstatechangeall('draw', null);
      }
      else if (mystate.gamestate ==  "END"){
          $.clearAllCanvas();
          storeTimer.dispatch(stopTimer());
          storeTimer.dispatch(resetTimer(TIMELIMIT_CONT));
          storeTimer.dispatch(startTimer(TIMELIMIT_CONT));
          storeGame.dispatch(startIdle());
          $.callstatechangeall('msg', null);
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

    return (
      <div>
        <div>Time: {this.checkStop(Math.round(elapsed))}</div>
        <div>
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
function startIdle() {
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
function startDiscuss() {
  return {
    type: "DISCUSS",
    gamestate: "DISCUSS"
  };
}
function startVote() {
  return {
    type: "VOTE",
    gamestate: "VOTE"
  };
}
function startVoteSpy() {
  return {
    type: "VOTESPY",
    gamestate: "VOTESPY"
  };
}
function startEnd(winner) {
  return {
    type: "END",
    gamestate: "END",
    winner: winner
  };
}

//reducer
function minigameonereducer(state = initialGameState, action) {
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
        loopcounter: state.loopcounter,
        winner: state.winner,
        words: state.words
      };
    case "DISCUSS":
      //alert("discuss state");
      return {
        ...state,
        //set new state
        gamestate: action.gamestate,
        loopcounter: state.loopcounter+1,
        winner: state.winner,
        words: state.words
      };
    case "VOTE":
      //send VOTE state to client
      return {
        ...state,
        //set new state
        gamestate: action.gamestate,
        loopcounter: state.loopcounter,
        winner: state.winner,
        words: state.words
        //set to END state
      }
      case "VOTESPY":
        //send VOTE state to client
        return {
          ...state,
          //set new state
          gamestate: action.gamestate,
          loopcounter: state.loopcounter,
          winner: state.winner,
          words: state.words
          //set to END state
        }
    case "END":
        //animate winner or loser
      return {
        ...state,
        gamestate: action.gamestate,
        loopcounter: 0,
        winner: action.winner,
        words: state.words
        //set new state
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
        //set new state
    }
    default:
      return state;
  }
}

class MiniGameOne extends React.Component {
  constructor(props){
    super(props);
  }


  render() {
    const gamestatelabel = this.props.gamestate;
    const loop = this.props.loopcounter;
    const words = this.props.words;
    return (
      <div>
        <div>{gamestatelabel} Round: {this.props.loopcounter} , Winner: {this.props.winner}</div>
        <div className="col">
          <WordList words={this.props.words} />
        </div>
      </div>
    );
  }
}

function mapStateToPropsGameOne(state) {
  return { gamestate: state.gamestate,
           loopcounter: state.loopcounter,
           winner: state.winner,
           words: state.words
         };
}
//END MINIGAME REDUX

//bind state to props
Timer = ReactRedux.connect(mapStateToPropsTimer, { startTimer, stopTimer, resetTimer })(Timer);
MiniGameOne = ReactRedux.connect(mapStateToPropsGameOne, { startDraw, startDiscuss, startVote })(MiniGameOne);

//add reducers to store
//const rootReducer = combineReducers({timerreducer, minigameonereducer});
export const storeTimer = Redux.createStore(timerreducer);
export const storeGame = Redux.createStore(minigameonereducer);

//WORDLIST REACT
function WordList(props) {
  let wordsInWordList = props.words;
  console.log("wordsinwordlist: "+wordsInWordList);
  const listItems = wordsInWordList.map((word) =>
    <button type="button" className="btn btn-secondary btn-lg" disabled>{word}</button>
  );
  return (
      <div>{listItems}</div>
  );
}
//END WORDLIST REACT


//MINIGAME LAYOUT
export class MiniGameOneLayout extends React.Component {

  render() {
    return (
      <div className="container-fluid">
         <div className="row justify-content-md-center">
          <div className="col-sm-2">
             <ReactRedux.Provider store={storeGame}>
              <MiniGameOne />
             </ReactRedux.Provider>
             <ReactRedux.Provider store={storeTimer}>
              <Timer updateInterval={1000} />
             </ReactRedux.Provider>
          </div>
          <div className="col-sm-10">
            <div>
            <div className="row">
              <div className="col-sm-3 text-center">
                <canvas id="canvas-p0" width="268" height="340"></canvas>
                <br/>
                player1
              </div>
              <div className="col-sm-3 text-center">
                <canvas id="canvas-p1" width="268" height="340"></canvas>
                <br/>
                player2
              </div>
              <div className="col-sm-3 text-center">
                <canvas id="canvas-p2" width="268" height="340"></canvas>
              </div>
              <div className="col-sm-3 text-center">
                <canvas id="canvas-p3" width="268" height="340"></canvas>
              </div>
            </div>

            <div className="row">
              <div className="col-sm-3 text-center">
                <canvas id="canvas-p4" width="268" height="340"></canvas>
              </div>
              <div className="col-sm-3 text-center">
                <canvas id="canvas-p5" width="268" height="340"></canvas>
              </div>
              <div className="col-sm-3 text-center">
                <canvas id="canvas-p6" width="268" height="340"></canvas>
              </div>
              <div className="col-sm-3 text-center">
                <canvas id="canvas-p7" width="268" height="340"></canvas>
              </div>
            </div>
            </div>
          </div>

         </div>

      </div>
    );
  }
}


let words = [];
let playernames = [];
let playersockets = [];
let secretPlace;
let socketLiar;
/* Open when someone clicks on the span element */
function openNav() {
    document.getElementById("myNav").style.height = "100%";
}

/* Close when someone clicks on the "x" symbol inside the overlay */
function closeNav() {
    document.getElementById("myNav").style.height = "0%";
}

function setupGame(){
  console.log("setup the game");
  words = populatewordarray();
  let clientsobj = $.returnAllPlayers();
  let numplayers = Object.keys(clientsobj).length;
  //pick rand number, that num is liar
  let liarnum = Math.floor(Math.random()*numplayers);
  let index = 0;
  secretPlace = Math.floor(Math.random()*words.length);
  //FOR LOOP
  for (let key in clientsobj){
    if (clientsobj.hasOwnProperty(key)){
      let playerobj = clientsobj[key];
      //add player names into an array
      playernames[playerobj.playernum] = playerobj.username;
      playersockets[playerobj.playernum] = playerobj.socketid;
      if (index == liarnum){
        socketLiar = playerobj.socketid;
        //set liar stuff
        console.log(helperbuckets);
        console.log(whichbuckets);
        let firsthint = helperbuckets[whichbuckets[0]][Math.floor(Math.random()*helperbuckets[whichbuckets[0]].length)];
        let secondhint = helperbuckets[whichbuckets[1]][Math.floor(Math.random()*helperbuckets[whichbuckets[1]].length)];
        let hintstring = "Hint: Trying drawing "+ firsthint +" or "+ secondhint;
        $.callstatechangeprivate('msg', 'you are liar', playerobj.socketid, hintstring);
      }
      else{
        //assign secret place
        $.callstatechangeprivate('msg', words[secretPlace], playerobj.socketid);
      }
      index++;
    }
  }
}
