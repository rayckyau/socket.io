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
import ProgressBar from 'react-progressbar.js';
import CountUp, { startAnimation } from 'react-countup';

const TIMELIMIT_DRAW = 90;
const TIMELIMIT_VOTE = 30;
const TIMELIMIT_DISCUSS = 30;
const TIMELIMIT_BEGIN = 10;
const TIMELIMIT_END = 10;
const TIMELIMIT_CONT = 5;

const PLACEBUCKETNUM = 2;
const PLACEPERBUCKET = 4;
const BUCKETS = 9;

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
"Iraq",
"Mongolia",
"Afghanistan",
"Egypt",
"Australia"];

helperbuckets[1] = [
"an exotic place",
"a desert"
];

//mountainous
placebuckets[2] = [
"Machu Picchu",
"Mount Everest",
"Middle Earth",
"Hawaii",
"Las Vegas"
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
"a life vest",
"an aquatic animal"
];

//sitting places
placebuckets[4] = [
"The Mall",
"Conference Room",
"Soccer Stadium",
"Coffee Shop"
]

helperbuckets[4] = [
"a person sitting",
"two people together"
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
"a picture frame",
"a photographer"
];

placebuckets[6] = [
  "Zombie Apocalypse",
  "Hiking Path",
  "Race Track"
]

helperbuckets[6] = [
"a person running"
];

placebuckets[7] = [
  "Hangar",
  "Space Agency",
  "Mars",
  "Outer Space",
  "Science Center"
]

helperbuckets[7] = [
"a rocket"
];

placebuckets[8] = [
  "Chemistry Class",
  "Emergency Room",
  "Doctor's Office",
  "Bathroom",
  "Hospital"
]

helperbuckets[8] = [
"a faucet",
"hand sanitizer"
];

placebuckets[9] = [
  "Horse Track",
  "Barn",
  "Zoo"
]

helperbuckets[9] = [
"a horse"
]

placebuckets[10] = [
  "Jungle",
  "Garden",
  "National Park",
  "Madagascar",
  "Forest"
]

helperbuckets[10] = [
"a tree",
"a butterfly"
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

  while (whichbuckets.length != 1){
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

    //when counting if vote state is spyredeem and a vote is in
    //we can skip straight to next state
    if (mystate.gamestate == "VOTESPY"){
      let votedLoc = $.retlastVote();
      if (votedLoc != null){
        $.callstatechangeall('msg', null, "All votes are in!");
        timeleft = 0;
      }
    }
    else if (mystate.gamestate == "VOTE"){
      //if the number of votes is equal to num of players
      //we can skip to next state
      if ($.isAllVoted()){
        $.callstatechangeall('msg', null, "All votes are in!");
        timeleft = 0;
      }
    }
    else {
      if ($.isReadyPlayers()){
        $.callstatechangeall('msg', null, "Everyone is ready!");
        timeleft = 0;
      }
    }

    if (timeleft <= 0){
      $.resetReadyPlayers();
      storeTimer.dispatch(stopTimer());
      if (mystate.gamestate ==  "DRAW"){
          //save drawings
          let canvases = $.getAllCanvas();
          for (let i=0;i<canvases.length;i++){
            playersave[i][mystate.loopcounter] = canvases[i].toDataURL();;
          }
          storeTimer.dispatch(startTimer(TIMELIMIT_DISCUSS));
          storeGame.dispatch(startDiscuss());
          $.callstatechangeall('msg', null, "Look at the main screen and try to find a suspicious drawing! Get ready for round 2!");
      }
      else if (mystate.gamestate ==  "DISCUSS"){
          if (mystate.loopcounter == 2){
            storeTimer.dispatch(startTimer(TIMELIMIT_VOTE));
            $.resetVotes();
            $.resetLastVoteData();
            storeGame.dispatch(startVote());
            //for all players
            for (let i=0;i<playernames.length;i++){
              let newvotestring = playernames.join().replace(playernames[i],'');
              newvotestring = newvotestring.replace(/(^,)|(,$)/g,'').replace(/(,\s*$)|(^,*)/,'');
              $.callstatechangeprivate('vote', "Vote for the Liar", playersockets[i], newvotestring);
            }
          }
          else{
            storeGame.dispatch(startDraw());
            $.clearAllCanvas();
            storeTimer.dispatch(startTimer(TIMELIMIT_DRAW));
            $.callstatechangeall('draw', null);
          }
      }
      else if (mystate.gamestate ==  "VOTE"){
          storeGame.dispatch(startVoteRecap());
          $.callstatechangeall('msg', 'Vote Summary', 'Look at the main screen for the vote summary.');
          storeTimer.dispatch(startTimer(TIMELIMIT_VOTE));
      }
      else if (mystate.gamestate ==  "VOTESPY"){
          //chance for spy to win
          //call returnDataVote function to get result
          let votedLoc = $.retlastVote();
          winner = "";
          console.log("voted: " + votedLoc + "secret: "+words[secretPlace])
          //if data is the same as target location spy wins, else spy loses
          if (votedLoc == words[secretPlace]){
            //spy wins
            winner = "Liar";
            $.callstatechangeall('msg', 'The winner is '+ playernames[liarnum] + " as the Liar!",
            "The Liar chose the correct secret place. Next time don't be so obvious!");
          }
          else{
            winner = "Everyone Else";
            $.callstatechangeall('msg', 'The winner is everyone else! The liar was '+ playernames[liarnum] + "!",
            "The Liar chose the correct secret place. Next time don't be so obvious!"););
          }
          storeGame.dispatch(startEnd(winner));
      }
      else if (mystate.gamestate ==  "VOTERECAP"){
          //call returnMajorityVote function to get result
          let majvote = $.retMajorityVote();
          //reveal winner
          if (majvote == -1){
            winner = "Liar";
            storeGame.dispatch(startEnd(winner));
            $.callstatechangeall('msg', 'The winner is '+ playernames[liarnum] + "as the Liar!");
          }else{
            console.log("liar redeem chance");
            $.callstatechangeall('msg', "Waiting for the Liar...",
              "The Liar was found out! However there is still a chance for the liar to win if they choose the correct location.");
            $.resetVotes();
            $.resetLastVoteData();
            //if spy is chosen move into new mode only for spy
            $.callstatechangeprivate("vote", "Choose the location", socketLiar , words.join())
            storeGame.dispatch(startVoteSpy());
          }
      }
      else if (mystate.gamestate ==  "GAMERECAP"){
          setupGame();
          storeTimer.dispatch(startTimer(TIMELIMIT_BEGIN));
          storeGame.dispatch(startBegin());
      }
      else if (mystate.gamestate ==  "IDLE"){
          setupGame();
          storeTimer.dispatch(startTimer(TIMELIMIT_BEGIN));
          storeGame.dispatch(startBegin());
      }
      else if (mystate.gamestate ==  "BEGIN"){
          storeTimer.dispatch(startTimer(TIMELIMIT_DRAW));
          storeGame.dispatch(startDraw());
          $.callstatechangeall('draw', null);
      }
      else if (mystate.gamestate ==  "END"){
          $.clearAllCanvas();
          storeGame.dispatch(startGameRecap());
          $.callstatechangeall('msg', 'recap game');
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
                strokeWidth: 4
            };
    let containerStyle = {
        width: '100px',
        height: '100px'
    };
    let Circle = ProgressBar.Circle;
    let roundedTime = Math.round(elapsed);
    let mystate = storeTimer.getState();
    return (
      <div className="Timer">
      <Circle
              progress={elapsed/mystate.baseTime}
              text={this.checkStop(roundedTime)}
              options={options}
              initialAnimate={true}
              containerStyle={containerStyle}
              containerClassName={'timerbar'} />
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
    gamestate: "VOTE",
    loopcounter: 0
  };
}
function startVoteSpy() {
  return {
    type: "VOTESPY",
    gamestate: "VOTESPY"
  };
}
function startVoteRecap() {
  return {
    type: "VOTERECAP",
    gamestate: "VOTERECAP"
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
        loopcounter: state.loopcounter+1,
        winner: state.winner,
        words: state.words
      };
    case "DISCUSS":
      //alert("discuss state");
      return {
        ...state,
        //set new state
        gamestate: action.gamestate,
        loopcounter: state.loopcounter,
        winner: state.winner,
        words: state.words
      };
    case "VOTE":
      //send VOTE state to client
      return {
        ...state,
        //set new state
        gamestate: action.gamestate,
        loopcounter: action.loopcounter,
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
    case "VOTERECAP":
      return {
        ...state,
        //set new state
        gamestate: action.gamestate,
        loopcounter: state.loopcounter,
        winner: state.winner,
        words: state.words
      }
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

  returnGameState(gamestatelabel){
    if (gamestatelabel == "VOTESPY"){
      return "Liar Chance"
    }
    else {
      return gamestatelabel;
    }
  }


  render() {
    const gamestatelabel = this.props.gamestate;
    const loop = this.props.loopcounter;
    const words = this.props.words;
    return (
      <div>
        <div id="gamestatelabel">{this.returnGameState(gamestatelabel)}</div>
        <div id="roundcounter">Round {this.props.loopcounter} </div>
        <div>{this.props.winner}</div>
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
MiniGameOne = ReactRedux.connect(mapStateToPropsGameOne, { startDraw, startDiscuss, startVote, startVoteRecap, startBegin, startIdle, startVoteSpy })(MiniGameOne);

//add reducers to store
//const rootReducer = combineReducers({timerreducer, minigameonereducer});
export const storeTimer = Redux.createStore(timerreducer);
export const storeGame = Redux.createStore(minigameonereducer);

//WORDLIST REACT
function WordList(props) {
  let wordsInWordList = props.words;
  const listItems = wordsInWordList.map((word) =>
    <button type="button" className="word btn btn-secondary btn-lg" disabled>{word}</button>
  );
  return (
      <div className="WordList">{listItems}</div>
  );
}
//END WORDLIST REACT


//MINIGAME LAYOUT
export class MiniGameOneLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {gamestate: null};
  }

  componentDidMount() {
    this.interval = setInterval(() => this.checkGameState(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  checkGameState(){
    //TODO: optimize by checking if state has changed first
    //only change state if state is GAMERECAP/VOTERECAP
    if ((storeGame.getState().gamestate == "GAMERECAP") || (storeGame.getState().gamestate == "VOTERECAP") || (storeGame.getState().gamestate == "BEGIN"))
    {
      this.setState({gamestate:storeGame.getState().gamestate});
    }
  }

  displayPage(gamestate){
    if (gamestate == 'GAMERECAP'){
      return (
        <div className="col-sm-10">
          <div>
          <div className="row">
            <div className="col-sm-3 text-center">
              <div id="cf">
                <img className="bottom" src={playersave[0][1]}/>
                <img className="top" src={playersave[0][2]}/>
              </div>
              <br/>
              {playernames[0]}
            </div>
            <div className="col-sm-3 text-center">
              <div id="cf">
                <img className="bottom" src={playersave[1][1]}/>
                <img className="top" src={playersave[1][2]}/>
              </div>
              <br/>
              {playernames[1]}
            </div>
            <div className="col-sm-3 text-center">
              <div id="cf">
                <img className="bottom" src={playersave[2][1]}/>
                <img className="top" src={playersave[2][2]}/>
              </div>
              <br/>
              {playernames[2]}
            </div>
            <div className="col-sm-3 text-center">
              <div id="cf">
                <img className="bottom" src={playersave[3][1]}/>
                <img className="top" src={playersave[3][2]}/>
              </div>
              <br/>
              {playernames[3]}
            </div>
          </div>

          <div className="row">
            <div className="col-sm-3 text-center">
              <div id="cf">
                <img className="bottom" src={playersave[4][1]}/>
                <img className="top" src={playersave[4][2]}/>
              </div>
              <br/>
              {playernames[4]}
            </div>
            <div className="col-sm-3 text-center">
              <div id="cf">
                <img className="bottom" src={playersave[5][1]}/>
                <img className="top" src={playersave[5][2]}/>
              </div>
              <br/>
              {playernames[5]}
            </div>
            <div className="col-sm-3 text-center">
              <div id="cf">
                <img className="bottom" src={playersave[6][1]}/>
                <img className="top" src={playersave[6][2]}/>
              </div>
              <br/>
              {playernames[6]}
            </div>
            <div className="col-sm-3 text-center">
              <div id="cf">
                <img className="bottom" src={playersave[7][1]}/>
                <img className="top" src={playersave[7][2]}/>
              </div>
              <br/>
              {playernames[7]}
            </div>
          </div>
          </div>
        </div>

      )
    }
    else if (gamestate == 'VOTERECAP'){
      playervotedata = $.retVoteData();
      playervotes = $.retVotes();
      console.log("voterecap store ojbs");
      console.log(playernames);
      console.log(playervotedata);
      console.log(playervotes);
      //TODO: use object keys loop and store object as a single 3 size array. playervotedata, playername, vote
      let votebardata = [];
      for (let i=0;i<playernames.length;i++){
        votebardata[i] = { playername: playernames[i],
                                  votenum: playervotes[i],
                           playervotedata: playervotedata[i]

                         }
      }
      console.log(votebardata);
      const listItems = votebardata.map((player) =>
        <VoteBar name={player.playername} votename={player.playervotedata} votenum={player.votenum}/>
      );
      return (
        <div className="col-sm-10">
        <div className="row justify-content-md-center">
          <div>{listItems}</div>
        </div>
        </div>
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
              <MiniGameOne />
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

class VoteBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="votebar">
        <div id="textdiv">
          <h1 id="name">{this.props.name}</h1>
          <p id="votedfor">voted for <b>{this.props.votename}</b></p>
        </div>
        <div id="numdiv">
          <h1 id="number"><CountUp start={0} end={this.props.votenum} /></h1>
        </div>
      </div>
    );
  }
}

export class CanvasLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {playerlabels: playernames};
  }

  componentDidMount() {
    this.interval = setInterval(() => this.updateNames(), 2000);

  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  updateNames() {
    //TODO: optimize by checking if state has changed first
    this.setState({playerlabels: playernames});
  }

  render() {
    return (
      <div className="col-sm-10">
        <div>
        <div className="row">
          <div className="col-sm-3 text-center">
            <canvas id="canvas-p0" width="268" height="340"></canvas>
            <br/>
            {this.state.playerlabels[0]}
          </div>
          <div className="col-sm-3 text-center">
            <canvas id="canvas-p1" width="268" height="340"></canvas>
            <br/>
            {this.state.playerlabels[1]}
          </div>
          <div className="col-sm-3 text-center">
            <canvas id="canvas-p2" width="268" height="340"></canvas>
            <br/>
            {this.state.playerlabels[2]}
          </div>
          <div className="col-sm-3 text-center">
            <canvas id="canvas-p3" width="268" height="340"></canvas>
            <br/>
            {this.state.playerlabels[3]}
          </div>
        </div>

        <div className="row">
          <div className="col-sm-3 text-center">
            <canvas id="canvas-p4" width="268" height="340"></canvas>
            <br/>
            {this.state.playerlabels[4]}
          </div>
          <div className="col-sm-3 text-center">
            <canvas id="canvas-p5" width="268" height="340"></canvas>
            <br/>
            {this.state.playerlabels[5]}
          </div>
          <div className="col-sm-3 text-center">
            <canvas id="canvas-p6" width="268" height="340"></canvas>
            <br/>
            {this.state.playerlabels[6]}
          </div>
          <div className="col-sm-3 text-center">
            <canvas id="canvas-p7" width="268" height="340"></canvas>
            <br/>
            {this.state.playerlabels[7]}
          </div>
        </div>
        </div>
      </div>

    )
  }
}


let words = [];
let playernames = [];
let playervotedata = [];
let playervotes = [];
let playersockets = [];
let playersave = [[],
                  [],
                  [],
                  [],
                  [],
                  [],
                  [],
                  [],
                ];
let playersaveagain = [];
let secretPlace;
let socketLiar;
let winner;
let liarnum;
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
  liarnum = Math.floor(Math.random()*numplayers);
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
        let firsthint = helperbuckets[whichbuckets[0]][Math.floor(Math.random()*helperbuckets[whichbuckets[0]].length)];
        //let secondhint = helperbuckets[whichbuckets[1]][Math.floor(Math.random()*helperbuckets[whichbuckets[1]].length)];
        let hintstring = "Hint: Try drawing "+firsthint+".";
        $.callstatechangeprivate('msg', 'You are the liar!', playerobj.socketid, hintstring);
      }
      else{
        //assign secret place
        $.callstatechangeprivate('msg', "Secret place: " + words[secretPlace], playerobj.socketid);
      }
      index++;
    }
  }
}
