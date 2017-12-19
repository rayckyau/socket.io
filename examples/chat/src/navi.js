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
      <label className="mybtn blue">
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
      yourPick: voteOptions[0] || ''
    }
    this.handleClick(voteOptions[0]);
  }

  handleClick(val) {
    this.setState({yourPick: val})
    storePlayer.dispatch(setVote(val));
    submitVote(val);
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
          {this.voteList()}
          <br/>
          <b>Voting for : {yourPick}</b>
        </div>
    )
  }

}

class TopNav extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      message: "HappyDraw!"
    }
  }

  render(){
    return (
      <nav className="TopNav navbar navbar-light sticky-top bg-faded">
        <div>{this.props.message}</div>
      </nav>
    )

  }
}

//TODO: super janky function to access socket. needs refactoring
function saveSessionToServer(data){
  $.saveSession(data);
}
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

function clearMouseEvent(){
  console.log("clear mouse event");
  $.clearMouseEvent();
}

class BotNav extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      clientmode: "",
      buttonLabel: "OK",
      data: 'payload',
      drawtype: 'INK'
    }
  }

  componentWillReceiveProps(nextProps){
    if (nextProps.mode !== this.state.clientmode){
      this.setState({clientmode: nextProps.mode,
                    buttonLabel: "OK",
                    data: 'payload',
                    drawtype: 'INK'}
      );
    }
  }

  clickButton(){
    //if i'm admin and i'm in lobby, ok button should ready gamename
    console.log("admin and gamestate: "+this.props.admin+" "+this.props.mainclientstate);
    if ((this.props.admin == true) && (this.props.mainclientstate == "lobby")){
      submitSend('admin');
      return;
    }

    if (this.props.mode == "vote"){
      submitSend('ready');
      storePlayer.dispatch(changeModeMsg(null, 'Voting completed!'));
    }
    else if (this.props.mode == "draw"){
      if (this.state.buttonLabel == "OK"){
        submitSend('ready');
        this.setState({clientmode: "draw",
                      buttonLabel: "Not Ready",
                      data: 'payload',
                      drawtype: 'INK'}
        );
      }else {
        submitSend('notready');
        this.setState({clientmode: "draw",
                      buttonLabel: "OK",
                      data: 'payload',
                      drawtype: 'INK'}
        );
      }
    }
    else {
      submitSend('ready');
      storePlayer.dispatch(changeModeMsg(null, 'Waiting on game...'));
    }
  }

  clickTypeButton(){
    if (this.props.mode == "draw"){
      if (this.state.drawtype == "ERASER"){
        this.setState({clientmode: this.state.clientmode,
                      buttonLabel: this.state.buttonLabel,
                      data: this.state.data,
                      drawtype: 'INK'
                      }
        );
        $.setDrawType('INK');
      }else {
        this.setState({clientmode: this.state.clientmode,
                      buttonLabel: this.state.buttonLabel,
                      data: this.state.data,
                      drawtype: 'ERASER'
                      }
        );
        $.setDrawType('ERASER');
      }
    }
  }

  render(){
    return (
        <nav className="navbar navbar-light sticky-bottom bg-faded ">
          <button className="mybtn green" type="button" onClick={() => this.clickButton()}>{this.state.buttonLabel}</button>
          <button className="mybtn blue" type="button" onClick={() => this.clickTypeButton()}>{this.state.drawtype}</button>
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
        <div id="mainmsg">{props.mainmsg}</div>
      )
    }
  }

  render(){
    return (
        <div className="container-fluid">
          <TopNav message={this.props.message}/>
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
  message: "HappyDraw!",
  mainmsg: "mainmsg",
  mainclientstate: "lobby"
};

//action creator
function changeModeDraw(msg) {
  return {
    type: "DRAW",
    mode: 'draw',
    message: msg,
  };
}
function changeModeVote(msg) {
  return {
    type: "VOTE",
    mode: 'vote',
    vote: '',
    message: msg,
  };
}
//if msg is null then do not change state
function changeModeMsg(msg, mainmsg="") {
  return {
    type: "MESSAGE",
    mode: 'msg',
    message: msg,
    mainmsg: mainmsg,
  };
}
function setVote(vote) {
  console.log(vote);
  return {
    type: "VOTE",
    mode: 'vote',
    vote: vote,
    message: '',
  };
}
function changeToAdmin(msg, vote="") {
  return {
    type: "ADMIN",
    admin: true,
    vote: vote,
    message: 'You are now game admin! Wait for others to join and press OK',
  };
}
function changeMainclientState(state) {
  return {
    type: "MAINCLIENTCHANGE",
    mainclientstate: state
  };
}

//reducer
function playerpagereducer(state = initialPlayerState, action) {
  switch (action.type) {
    case "DRAW":
      if (action.message == null){
        action.message = state.message;
      }
      return {
        ...state,
        //set new state
        mode: action.mode,
        admin: state.admin,
        vote: state.vote,
        message: action.message,
        mainmsg: state.mainmsg,
        mainclientstate: state.mainclientstate
      };
    case "VOTE":
      if (action.message == null){
        action.message = state.message;
      }
      return {
        ...state,
        //set new state
        mode: action.mode,
        admin: state.admin,
        vote: action.vote,
        message: action.message,
        mainmsg: state.mainmsg,
        mainclientstate: state.mainclientstate
      };
    case "MESSAGE":
      if (action.message == null){
        action.message = state.message;
      }
      return {
        ...state,
        //set new state
        mode: action.mode,
        admin: state.admin,
        vote: state.vote,
        message: action.message,
        mainmsg: action.mainmsg,
        mainclientstate: state.mainclientstate
      };
    case "ADMIN":
      if (action.message == null){
        action.message = state.message;
      }
      return {
        ...state,
        //set new state
        mode: state.mode,
        admin: action.admin,
        vote: state.vote,
        message: action.message,
        mainmsg: state.mainmsg,
        mainclientstate: state.mainclientstate
      };
    case "MAINCLIENTCHANGE":
      if (action.message == null){
        action.message = state.message;
      }
      return {
        ...state,
        //set new state
        mode: state.mode,
        admin: state.admin,
        vote: state.vote,
        message: state.message,
        mainmsg: state.mainmsg,
        mainclientstate: action.mainclientstate
      };
    default:
      return state;
  }
}

function mapStateToPropsPlayerPage(state) {
  return { mode: state.mode,
           admin: state.admin,
           vote: state.vote,
           message: state.message,
           mainmsg: state.mainmsg,
           mainclientstate: state.mainclientstate
         };
}
function mapStateToPropsBotNav(state) {
  return { mode: state.mode,
           admin: state.admin,
           mainclientstate: state.mainclientstate
         };
}
//END MINIGAME REDUX

//bind state to props
PlayerPage = ReactRedux.connect(mapStateToPropsPlayerPage, { changeModeMsg, changeModeVote, changeModeDraw, setVote, changeToAdmin, changeMainclientState })(PlayerPage);
BotNav = ReactRedux.connect(mapStateToPropsBotNav)(BotNav);
//add reducers to store
//const rootReducer = combineReducers({timerreducer, minigameonereducer});
const storePlayer = Redux.createStore(playerpagereducer);
var voteOptions = [];

export function setAdmin(){
  storePlayer.dispatch(changeToAdmin());
}

export function setGame(gamestate){
  storePlayer.dispatch(changeMainclientState(gamestate));
}

export function changePlayerState(mystate, msg, payload = ""){
  clearMouseEvent();
  saveSessionToServer({state:mystate, message:msg, payload:payload});
  //change player state
  if (mystate == 'draw'){
    storePlayer.dispatch(changeModeDraw(msg));
    //update context canvas in main
    mountCanvas();
  }
  else if (mystate == 'vote'){
    //reset voteOptions
    voteOptions.length = 0;
    //take payload and add to votes array
    let players = payload.split(",");
    for (let i=0;i<players.length;i++){
      voteOptions[i] = players[i];
    }
    storePlayer.dispatch(changeModeVote(msg));
  }
  else if (mystate == 'msg'){
    storePlayer.dispatch(changeModeMsg(msg, payload));
  }
  else {
    storePlayer.dispatch(changeModeMsg("no state found in data"));
  }
}

export function changePlayerMessage(msg){
    storePlayer.dispatch(changeModeMsg(msg));
}

ReactDOM.render(
  <ReactRedux.Provider store={storePlayer}>
    <PlayerPage />
  </ReactRedux.Provider>  ,
  document.getElementById('root')
)
