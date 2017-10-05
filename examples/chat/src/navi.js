/*jshint esversion: 6 */

import React from 'react'
import ReactDom from 'react-dom'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

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

class BotNav extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      buttonLabel: 'OK',
      data: 'payload'
    }
  }

  clickButton(){
    //send ok to socket
    socket.emit('sendbutton', {
      'player': mainclientid,
      'data': this.state.data
    });
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

  displayPage(page){
    if (page == 'vote'){
      return (
        <Vote/>
      )
    }
    else if (page == 'draw'){
      return (
        <DrawCanvas/>
      )
    }
    else{
      return (
        <div>No page state detected!</div>
      )
    }
  }

  render(){
    return (
        <div className="container-fluid">
          <TopNav />
            <div className="mx-auto d-block">
              {this.displayPage(this.state.page)}
            </div>
          <BotNav />
        </div>
    )

  }
}

ReactDOM.render(
  <PlayerPage />,
  document.getElementById('root')
)