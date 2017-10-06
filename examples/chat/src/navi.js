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
      items: ['player1', 'player2', 'player3', 'player4', 'player5'],
      yourPick: ''
    }
  }

  handleClick(val) {
    this.setState({yourPick: val})
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
function submitSend(){
  $.subSend();
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
    submitSend();
    //change state to msg mode
    storePlayer.dispatch(changeModeMsg('my message'));
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
            <div className="mx-auto d-block">
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

//reducer
function playerpagereducer(state = initialPlayerState, action) {
  switch (action.type) {
    case "DRAW":
      return {
        ...state,
        //set new state
        mode: action.mode,
        admin: state.admin,
        message: action.message
      };
    case "VOTE":
      return {
        ...state,
        //set new state
        mode: action.mode,
        admin: state.admin,
        message: action.message
      };
      case "MESSAGE":
        return {
          ...state,
          //set new state
          mode: action.mode,
          admin: state.admin,
          message: action.message
        };
    default:
      return state;
  }
}

function mapStateToPropsPlayerPage(state) {
  return { mode: state.mode,
           admin: state.admin,
           message: state.message
         };
}
//END MINIGAME REDUX

//bind state to props
PlayerPage = ReactRedux.connect(mapStateToPropsPlayerPage, { changeModeMsg, changeModeVote, changeModeDraw })(PlayerPage);

//add reducers to store
//const rootReducer = combineReducers({timerreducer, minigameonereducer});
const storePlayer = Redux.createStore(playerpagereducer);

ReactDOM.render(
  <ReactRedux.Provider store={storePlayer}>
    <PlayerPage />
  </ReactRedux.Provider>  ,
  document.getElementById('root')
)
