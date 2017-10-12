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

const placebuckets = [];
placebuckets[0] = ["paris",
"New york city",
"canada",
"london",
"rome",
"barcelona",
"amsterdam",
"tokyo",
"shanghai",
"afghanistan",
"egypt",
"malaysia",
"australia",
"california"];

placebuckets[1] = [
"outerspace",
"machu pichu",
"mount everest",
"mount fuji",
"coffee shop",
"Stonehenge",
"Las Vegas",
"ancient China"
]

placebuckets[2] = [
"medieval castle",
"middle earth",
"museum",
"beach",
"aquarium",
"deserted island",
"art gallery"
]

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
  let retarray = [];
  for (let j=0;j<3;j++){
    for (let i=0;i<4;i++){
      let randword = placebuckets[j][Math.floor(Math.random() * placebuckets[j].length)];

      while (contains(retarray, randword)){
        randword = placebuckets[j][Math.floor(Math.random() * placebuckets[j].length)];
      }
      retarray[retarraycount] = randword;
      retarraycount = retarraycount+1;

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
    if (timeleft <= 0){
      var mystate = storeGame.getState();
      //alert(mystate.loopcounter);
      if (mystate.gamestate ==  "DRAW"){
          storeTimer.dispatch(stopTimer());
          storeTimer.dispatch(startTimer(5));
          storeGame.dispatch(startDiscuss());
          $.callstatechangeall('msg');
      }
      else if (mystate.gamestate ==  "DISCUSS"){
          storeTimer.dispatch(stopTimer());
          if (mystate.loopcounter == 2){
            storeTimer.dispatch(resetTimer(10));
            storeTimer.dispatch(startTimer(10));
            storeGame.dispatch(startVote());
            $.callstatechangeall('vote', "vote for liar", playernames.join());
          }
          else{
            storeGame.dispatch(startDraw());
            $.clearAllCanvas();
            storeTimer.dispatch(resetTimer(5));
            storeTimer.dispatch(startTimer(5));
            $.callstatechangeall('draw');
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
            //if spy is chosen move into new mode only for spy
            $.callstatechangeprivate("vote", "choose the location", socketLiar , words.join())
            storeGame.dispatch(startVoteSpy());
          }
          storeTimer.dispatch(resetTimer(15));
          storeTimer.dispatch(startTimer(15));
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
          storeTimer.dispatch(resetTimer(10));
          storeTimer.dispatch(startTimer(10));
          $.callstatechangeall('winner is '+ winner);
      }
      else if (mystate.gamestate ==  "IDLE"){
          setupGame();
          storeTimer.dispatch(stopTimer());
          storeTimer.dispatch(resetTimer(10));
          storeTimer.dispatch(startTimer(10));
          storeGame.dispatch(startBegin());
      }
      else if (mystate.gamestate ==  "BEGIN"){
          storeTimer.dispatch(stopTimer());
          storeTimer.dispatch(resetTimer(10));
          storeTimer.dispatch(startTimer(10));
          storeGame.dispatch(startDraw());
          $.callstatechangeall('draw');
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
          <button onClick={() => storeTimer.dispatch(startTimer(60))}>start</button>
          <button onClick={() => storeTimer.dispatch(stopTimer())}>stop</button>
          <button onClick={() => storeTimer.dispatch(resetTimer(60))}>res</button>
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
  winner: ""
};

//action creators
function startBegin() {
  return {
    type: "BEGIN",
    gamestate: "BEGIN"
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
    case "DRAW":
      //send DRAW state to client
      //alert("draw state");
      //change timer to 60 sec
      //storeTimer.dispatch(stopTimer());
      return {
        ...state,
        //set new state
        gamestate: action.gamestate,
        loopcounter: state.loopcounter,
        winner: state.winner
      };
    case "DISCUSS":
      //alert("discuss state");
      return {
        ...state,
        //set new state
        gamestate: action.gamestate,
        loopcounter: state.loopcounter+1,
        winner: state.winner
      };
    case "VOTE":
      //send VOTE state to client
      return {
        ...state,
        //set new state
        gamestate: action.gamestate,
        loopcounter: state.loopcounter,
        winner: state.winner
        //set to END state
      }
      case "VOTESPY":
        //send VOTE state to client
        return {
          ...state,
          //set new state
          gamestate: action.gamestate,
          loopcounter: state.loopcounter,
          winner: state.winner
          //set to END state
        }
    case "END":
        //animate winner or loser
      return {
        ...state,
        gamestate: action.gamestate,
        loopcounter: 0,
        winner: action.winner
        //set new state
      }
    case "BEGIN":
        //rules stuff
      return {
        ...state,
        gamestate: action.gamestate,
        loopcounter: 0,
        winner: state.winner
      }
    case "IDLE":
        //wait
      return {
        ...state,
        gamestate: action.gamestate,
        loopcounter: 0,
        winner: state.winner
        //set new state
    }
    default:
      return state;
  }
}

class MiniGameOne extends React.Component {
  render() {
    const gamestatelabel = this.props.gamestate;
    const loop = this.props.loopcounter;
    return (
      <div>
        <div>{gamestatelabel} Round: {this.props.loopcounter} , Winner: {this.props.winner}</div>
      </div>
    );
  }
}

function mapStateToPropsGameOne(state) {
  return { gamestate: state.gamestate,
           loopcounter: state.loopcounter,
           winner: state.winner
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
  const words = props.words;
  const listItems = words.map((word) =>
    <button type="button" className="btn btn-secondary btn-lg" disabled>{word}</button>
  );
  return (
      <div>{listItems}</div>
  );
}
//END WORDLIST REACT

//OVERLAY REACT
function OverlayWords(props) {
  const words = props.words;
  const listItems = words.map((word) =>
    <button type="button" className="btn btn-secondary btn-lg" disabled>{word}</button>
  );
  return (
      <div>{listItems}</div>
  );
}
//END OVERLAY REACT
export class TestLayout extends React.Component {
  render() {
    return (
      <div>
      testlayout
      </div>
    );
  }
}
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
             <div className="col">
               <WordList words={words} />
             </div>
          </div>
          <div className="col-sm-10">
            <div>
            <div className="row">
              <div className="col-sm-3 text-center" align="center">
                <canvas id="canvas-p0" width="268" height="340"></canvas>
                <br/>
                player1
              </div>
              <div className="col-sm-3 text-center" align="center">
                <canvas id="canvas-p1" width="268" height="340"></canvas>
                <br/>
                player2
              </div>
              <div className="col-sm-3 text-center" align="center">
                <canvas id="canvas-p2" width="268" height="340"></canvas>
              </div>
              <div className="col-sm-3 text-center" align="center">
                <canvas id="canvas-p3" width="268" height="340"></canvas>
              </div>
            </div>

            <div className="row">
              <div className="col-sm-3 text-center" align="center">
                <canvas id="canvas-p4" width="268" height="340"></canvas>
              </div>
              <div className="col-sm-3 text-center" align="center">
                <canvas id="canvas-p5" width="268" height="340"></canvas>
              </div>
              <div className="col-sm-3 text-center" align="center">
                <canvas id="canvas-p6" width="268" height="340"></canvas>
              </div>
              <div className="col-sm-3 text-center" align="center">
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


//const words = ["word1", "word2","word3","word4","word5","word6","word7","word8","word9","word10","word11","word12"];
const words = populatewordarray();
let playernames = [];
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
  let clientsobj = $.returnAllPlayers();
  let numplayers = Object.keys(clientsobj).length;
  //pick rand number, that num is liar
  let liarnum = Math.floor(Math.random()*numplayers);
  let index = 0;
  //FOR LOOP
  for (let key in clientsobj){
    if (clientsobj.hasOwnProperty(key)){
      let playerobj = clientsobj[key];
      //add player names into an array
      playernames[playerobj.playernum] = playerobj.username;

      if (index == liarnum){
        //save liar
        socketLiar = playerobj.socketid;
        //set liar stuff
        console.log("send msg to liar");
        $.callstatechangeprivate('msg', 'you are liar', playerobj.socketid);
      }
      else{
        console.log("send msg to else");
        //assign secret place
        secretPlace = Math.floor(Math.random()*words.length);
        $.callstatechangeprivate('msg', words[secretPlace], playerobj.socketid);
      }
      index++;
    }
  }
}
