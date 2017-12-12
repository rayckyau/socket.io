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
const TIMELIMIT_VOTE = 60;
const TIMELIMIT_DISCUSS = 30;
const TIMELIMIT_BEGIN = 20;
const TIMELIMIT_END = 10;
const TIMELIMIT_CONT = 5;

const PLACEBUCKETNUM = 2;
const PLACEPERBUCKET = 4;
const BUCKETS = 9;

const placebuckets = [];
const helperbuckets = [];
const whichbuckets = [];

let majorityVote = -1;

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

//return player number with highest votes
//return -1 if no majority vote
function setMajorityVote(pnum){
  majorityVote = pnum;
}

function getMajorityVote(){
  return majorityVote;
}

//return array vote count also calculate majority vote
function countVotes(arraydata){
  setMajorityVote(-1);
  let highestNum = -1;
  let retArray = [0,0,0,0,0,0,0,0];
  for (let i=0;i<arraydata.length;i++){
    let playernum = $.getPlayernumById(arraydata[i]);
    retArray[playernum]++;

    if (highestNum == retArray[playernum]){
      retArray[playernum];
      setMajorityVote(-1);
    }
    else if (highestNum < retArray[playernum]){
      highestNum = retArray[playernum];
      setMajorityVote(playernum);
    }

  }

  return retArray;
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
      if ($.isReadyPlayerNum(liarnum)){
        $.callstatechangeall('msg', null, "All votes are in!");
        timeleft = 0;
      }
    }
    else if (mystate.gamestate == "VOTE"){
      //if the number of votes is equal to num of players
      //we can skip to next state
      if ($.isReadyPlayers()){
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
              newvotestring = newvotestring.replace(/,+/g,',').replace(/(^,)|(,$)/g,'');
              $.callstatechangeprivate('vote', "Vote for The Imposter", playersockets[i], newvotestring);
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
          let votedLoc = $.retVoteData()[liarnum];
          winner = "";
          console.log("voted: " + votedLoc + "secret: "+words[secretPlace])
          //if data is the same as target location spy wins, else spy loses
          if (votedLoc == words[secretPlace]){
            //spy wins
            winner = "The Imposter";
            $.callstatechangeall('msg', 'The winner is '+ playernames[liarnum] + " as The Imposter!",
            "The Imposter chose the correct secret place. Next time don't be so obvious!");
          }
          else{
            winner = "Everyone Else";
            $.callstatechangeall('msg', 'The Illuminati wins! The Imposter was '+ playernames[liarnum] + "!",
            "Good job everyone you caught The Imposter!");
          }
          storeGame.dispatch(startEnd(winner));
      }
      else if (mystate.gamestate ==  "VOTERECAP"){
          //call returnMajorityVote function to get result
          let majvote = getMajorityVote();
          console.log("MAJORITY: "+majvote + playernames[liarnum] + liarnum);
          if (majvote == liarnum){
            $.callstatechangeall('msg', "Waiting for The Imposter...",
              "The Imposter was found! There is still a chance for The Imposter to win if they choose the correct Secret Word.");
            $.resetVotes();
            $.resetLastVoteData();
            //if spy is chosen move into new mode only for spy
            $.callstatechangeprivate("vote", "Choose the Secret Word.", socketLiar , words.join())
            storeGame.dispatch(startVoteSpy());
          }
          else if (majvote === -1){
            winner = "The Imposter";
            storeGame.dispatch(startEnd(winner));
            $.callstatechangeall('msg', 'The winner is '+ playernames[liarnum] + " as The Imposter!", "There was no majority vote!");
          }
          else{
            winner = "The Imposter";
            storeGame.dispatch(startEnd(winner));
            $.callstatechangeall('msg', 'The winner is '+ playernames[liarnum] + " as The Imposter!", "The Illuminati did not find The Imposter!");
          }
      }
      else if (mystate.gamestate ==  "GAMERECAP"){
        if ($.retlastVote() == "Back To Lobby"){
          console.log("end of GAMERECAP state choose EXIT");
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
          storeTimer.dispatch(resetTimer(99));
          storeGame.dispatch(startGameRecap());
          $.callstatechangeall('msg', 'Game Recap', 'Check out the main screen for a recap of the game.');
          $.callstatechangeprivate("vote", "Keep playing?", socketLiar , "Keep playing,Back To Lobby")
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
    let Circle = ProgressBar.Circle;
    let roundedTime = Math.round(elapsed);
    let mystate = storeTimer.getState();
    return (
      <div className="Timer">
      <Circle
              progress={Math.max(0,(elapsed-1)/mystate.baseTime)}
              text={Math.max(0,(parseInt((this.checkStop(roundedTime)-1)) || 0))}
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
export function startIdle() {
  return {
    type: "IDLE",
    gamestate: "IDLE",
    winner: ""
  };
}
function startBegin() {
  //close rules nav
  closeNav();
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
function startExit() {
  return {
    type: "EXIT",
    gamestate: "EXIT"
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

class MiniGameOne extends React.Component {
  constructor(props){
    super(props);
  }

  returnGameState(gamestatelabel){
    if (gamestatelabel == "VOTESPY"){
      return "Imposter Chance"
    }
    else {
      return gamestatelabel;
    }
  }

  returnRoundCounter(roundCounter){
    if (roundCounter === 0){
      return ""
    }
    else if (roundCounter === 1){
      return "Round 1/2";
    }
    else if (roundCounter === 2){
      return "Round 2/2";
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
  const listItems = wordsInWordList.map((word, index) =>
    <button type="button" key={"word"+index} className="word btn btn-secondary btn-lg" disabled>{word}</button>
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
        mystyle = {position: 'absolute'};
      }
      return(
        <div className="col-sm-3 text-center" key={'canvasitem'+index}>
          <div id="cf">
            <img className="bottom" src={playersave[index][1]} width={"268"} height={"340"}/>
            <img className="top" src={playersave[index][2]} width={"268"} height={"340"}/>
          </div>
          <div id="playerlabel" style={mystyle}>{playernames[index]}</div>
        </div>
      );
    });


    if (gamestate == 'GAMERECAP'){
      return (
        <div className="col-sm-10">
          <div>
          <div className="row justify-content-md-center">
            {canvasitems}
          </div>
          </div>
        </div>

      )
    }
    else if (gamestate == 'VOTERECAP'){
      playervotedata = $.retVoteData();
      playervotes = countVotes(playervotedata);
      //TODO: use object keys loop and store object as a single 3 size array. playervotedata, playername, vote
      let votebardata = [];
      for (let i=0;i<playernames.length;i++){
        votebardata[i] = { playername: playernames[i],
                                  votenum: playervotes[i],
                           playervotedata: playervotedata[i]

                         }
      }
      const listItems = votebardata.map((player, index) =>
        <VoteBar name={player.playername} votename={player.playervotedata} votenum={player.votenum} voteready={this.state.playerreadylabels[index]} key={'votebar'+player.playername}/>
      );
      return (
        <div className="col-sm-10">
          <div className="row">
            {listItems}
          </div>
        </div>
      )
    }
    else if (gamestate == 'IDLE'){
      openNav();
      setTimeout(function () {
        closeNav();
      }, 30000);

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
    let mystyle = {color: 'black'};
    if (this.props.voteready == true){
      mystyle = {color: 'green'};
    }
    return (
      <div className="votebar">
        <div id="textdiv">
          <h1 id="name" style={mystyle}>{this.props.name}</h1>
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
        let mystyle = {position: 'absolute'};
        if (this.state.playerreadylabels[index] == true){
          mystyle = {position: 'absolute', color: 'green'};
        }
        return(
          <div className="col-sm-3 text-center" key={"canvas-p"+index}>
            <canvas id={"canvas-p"+index} width={"268"} height={"340"}></canvas>
            <br/>
            <div id="playerlabel" style={mystyle}>{this.state.playerlabels[index]}</div>
          </div>
        );
    });
    return (
      <div className="col-sm-10 rightpanel">
        <div>
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

function openNav() {
    document.getElementById("rules").style.height = "100%";
}
function closeNav() {
    document.getElementById("rules").style.height = "0%";
}

export function handleReconnect(){
  console.log("handle reconnect minigameone");
  //liarnum is player canvas of liar
  //verify/update all playersockets
  let clientsobj = $.returnAllPlayers();

  for (let key in clientsobj){
    if (clientsobj.hasOwnProperty(key)){
      let playerobj = clientsobj[key];
      playernames[playerobj.playernum] = playerobj.username;
      playersockets[playerobj.playernum] = playerobj.socketid;
      if (playerobj.playernum == liarnum){
        socketLiar = playerobj.socketid;
      }
    }
  }
}

function setupGame(){
  $.resetReadyPlayers();
  console.log("setup the game");
  words = populatewordarray();
  let clientsobj = $.returnAllPlayers();
  let numplayers = Object.keys(clientsobj).length;
  //pick rand number, that num is liar
  liarnum = Math.floor(Math.random()*numplayers);
  secretPlace = Math.floor(Math.random()*words.length);
  //FOR LOOP
  for (let key in clientsobj){
    if (clientsobj.hasOwnProperty(key)){
      let playerobj = clientsobj[key];
      //add player names into an array
      playernames[playerobj.playernum] = playerobj.username;
      playersockets[playerobj.playernum] = playerobj.socketid;
      if (playerobj.playernum == liarnum){
        socketLiar = playerobj.socketid;
        //set liar stuff
        let firsthint = helperbuckets[whichbuckets[0]][Math.floor(Math.random()*helperbuckets[whichbuckets[0]].length)];
        let hintstring = "Hint: Try drawing "+firsthint+".";
        $.callstatechangeprivate('msg', 'You are The Imposter!', socketLiar, hintstring);
      }
      else{
        //assign secret place
        $.callstatechangeprivate('msg', "Secret Word: " + words[secretPlace], playerobj.socketid);
      }
    }
  }
}
