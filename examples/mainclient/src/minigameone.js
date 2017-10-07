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
          storeTimer.dispatch(startTimer(10));
          storeGame.dispatch(startDiscuss());
          $.callstatechangeall('msg');
      }
      else if (mystate.gamestate ==  "DISCUSS"){
          if (mystate.loopcounter == 2){
            storeTimer.dispatch(resetTimer(15));
            storeTimer.dispatch(startTimer(15));
            storeGame.dispatch(startVote());
            $.callstatechangeall('vote');
          }
          else{
            storeGame.dispatch(startDraw());
            $.clearAllCanvas();
            storeTimer.dispatch(resetTimer(30));
            storeTimer.dispatch(startTimer(30));
            $.callstatechangeall('draw');
          }
      }
      else if (mystate.gamestate ==  "VOTE"){
          storeGame.dispatch(startEnd());
          $.callstatechangeall('msg');
      }
      else if (mystate.gamestate ==  "IDLE"){
          storeGame.dispatch(startDraw());
          storeTimer.dispatch(resetTimer(30));
          storeTimer.dispatch(startTimer(30));
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
  loopcounter: 0
};

//action creators
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
function startEnd() {
  return {
    type: "END",
    gamestate: "END"
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
        loopcounter: state.loopcounter
      };
    case "DISCUSS":
      //alert("discuss state");
      return {
        ...state,
        //set new state
        gamestate: action.gamestate,
        loopcounter: state.loopcounter+1
      };
    case "VOTE":
      //send VOTE state to client
      return {
        ...state,
        //set new state
        gamestate: action.gamestate,
        loopcounter: state.loopcounter
        //set to END state
      }
    case "END":
        //animate winner or loser
      return {
        ...state,
        gamestate: action.gamestate,
        loopcounter: 0
        //set new state
      }
    case "IDLE":
        //wait
      return {
        ...state,
        gamestate: action.gamestate,
        loopcounter: 0
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
        <div>{gamestatelabel} Round: {this.props.loopcounter}</div>
      </div>
    );
  }
}

function mapStateToPropsGameOne(state) {
  return { gamestate: state.gamestate,
           loopcounter: state.loopcounter
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
         <div className="row justify-content-md-cente">
          <div className="col-sm-4">
             <ReactRedux.Provider store={storeGame}>
              <MiniGameOne />
             </ReactRedux.Provider>
             <ReactRedux.Provider store={storeTimer}>
              <Timer updateInterval={1000} />
             </ReactRedux.Provider>
          </div>
          <div className="col-sm-8">
            <WordList words={words} />
          </div>
         </div>
         <div>
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
      </div>
    );
  }
}


const words = ["word1", "word2","word3","word4","word5","word6","word7","word8","word9","word10","word11","word12"];

/* Open when someone clicks on the span element */
function openNav() {
    document.getElementById("myNav").style.height = "100%";
}

/* Close when someone clicks on the "x" symbol inside the overlay */
function closeNav() {
    document.getElementById("myNav").style.height = "0%";
}
