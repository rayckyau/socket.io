/*jshint esversion: 6 */

import React from 'react'
import ReactDom from 'react-dom'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import * as ReactRedux from 'react-redux';
import * as Redux from 'redux';

class DrawCanvas extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      width: 268,
      height: 340,
      playerid: 'p1'
    }
  }

  componentDidMount() {
    console.log("render canvas mounted");
  }

  componentWillUnmount() {
    //cleanup garbage canvas
  }

  render() {
    return (
      <canvas id="paper" width={this.state.width} height={this.state.height}></canvas>
    );
  }
}

function VoteItem(props) {
    return (
      <label className="btn btn-outline-primary">
        <input className="vote" type="radio" value={props.value} onClick={props.onClick}/>
        {props.value}
      </label>
    );
  }

class Vote extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      items: voteOptions,
      yourPick: ''
    }
  }

  handleClick(val) {
    this.setState({yourPick: val})
    storePlayer.dispatch(setVote(val));
  }

  voteList() {
    return (
        <div className="btn-group-vertical">
          {this.state.items.map((item) =>
            <VoteItem key={item.toString()}
                      value={item}
                      onClick={() => this.handleClick(item.toString())}/>
          )}
        </div>
    );
  }

  render() {
    const yourPick = this.state.yourPick;
    return (
        <div>
          <b>{yourPick}</b>
          {this.voteList()}
        </div>
    )
  }

}

class TopNav extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      message: 'asd'
    }
  }

  render(){
    return (
      <nav className="navbar navbar-light sticky-top bg-faded">
        <div>{this.state.message}</div>
      </nav>
    )

  }
}

//TODO: super janky function to access socket. needs refactoring
function submitSend(payload){
  $.subSend(payload);
}
function submitVote(payload){
  $.voteSend(payload);
}

function mountCanvas(){
  console.log("mount canvas");
  $.mountCanvas();
}

class BotNav extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      buttonLabel: 'OK',
      data: 'payload'
    }
  }

  clickButton(){
    let mystate = storePlayer.getState();
    if (mystate.mode == "vote"){
      submitVote(mystate.vote);
    }
    else{
      submitSend('testpayload');
    }
    //change state to msg mode
    storePlayer.dispatch(changeModeMsg('submitted'));
  }

  render(){
    return (
        <nav className="navbar navbar-light sticky-bottom bg-faded ">
          <button className="btn btn-outline-success" type="button" onClick={() => this.clickButton()}>{this.state.buttonLabel}</button>
        </nav>
    )

  }
}


class PlayerPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      minigame: '0',
      page: 'draw'
    }
  }

  displayPage(props){
    if (props.mode == 'vote'){
      return (
        <Vote/>
      )
    }
    else if (props.mode == 'draw'){
      return (
        <DrawCanvas/>
      )
    }
    else{
      return (
        <div>{props.message}</div>
      )
    }
  }

  render(){
    return (
        <div className="container-fluid">
          <TopNav />
            <div className="mx-auto d-block" id="pageBG">
              {this.displayPage(this.props)}
            </div>
          <BotNav />
        </div>
    )

  }
}

const initialPlayerState = {
  mode: "draw",
  admin: false,
  vote: "",
  message: "hello world"
};

//action creator
function changeModeDraw(msg) {
  return {
    type: "DRAW",
    mode: 'draw',
    message: msg
  };
}
function changeModeVote(msg) {
  return {
    type: "VOTE",
    mode: 'vote',
    vote: '',
    message: msg
  };
}
function changeModeMsg(msg) {
  return {
    type: "MESSAGE",
    mode: 'msg',
    message: msg
  };
}
function setVote(vote) {
  console.log(vote);
  return {
    type: "VOTE",
    mode: 'vote',
    vote: vote,
    message: ''
  };
}

//reducer
function playerpagereducer(state = initialPlayerState, action) {
  switch (action.type) {
    case "DRAW":
      return {
        ...state,
        //set new state
        mode: action.mode,
        admin: state.admin,
        vote: state.vote,
        message: action.message
      };
    case "VOTE":
      return {
        ...state,
        //set new state
        mode: action.mode,
        admin: state.admin,
        vote: action.vote,
        message: action.message
      };
      case "MESSAGE":
        return {
          ...state,
          //set new state
          mode: action.mode,
          admin: state.admin,
          vote: state.vote,
          message: action.message
        };
    default:
      return state;
  }
}

function mapStateToPropsPlayerPage(state) {
  return { mode: state.mode,
           admin: state.admin,
           vote: state.vote,
           message: state.message
         };
}
//END MINIGAME REDUX

//bind state to props
PlayerPage = ReactRedux.connect(mapStateToPropsPlayerPage, { changeModeMsg, changeModeVote, changeModeDraw, setVote })(PlayerPage);

//add reducers to store
//const rootReducer = combineReducers({timerreducer, minigameonereducer});
const storePlayer = Redux.createStore(playerpagereducer);
var voteOptions = [];
//getter for playerstore
export function changePlayerState(mystate, msg, payload = ""){
  //change player state
  if (mystate == 'draw'){
    storePlayer.dispatch(changeModeDraw(msg));
    //update context canvas in main
    mountCanvas();
  }
  else if (mystate == 'vote'){
    //take payload and add to votes array
    let players = payload.split(",");
    for (let i=0;i<players.length;i++){
      voteOptions[i] = players[i];
    }
    storePlayer.dispatch(changeModeVote(msg));
  }
  else if (mystate == 'msg'){
    storePlayer.dispatch(changeModeMsg(msg));
  }
  else {
    storePlayer.dispatch(changeModeMsg("no state found in data"));
  }
}

ReactDOM.render(
  <ReactRedux.Provider store={storePlayer}>
    <PlayerPage />
  </ReactRedux.Provider>  ,
  document.getElementById('root')
)
