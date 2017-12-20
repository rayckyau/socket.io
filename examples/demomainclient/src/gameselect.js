import * as env from './env';

let ENVIRONMENT = env.ENVIRONMENT;
//GAME SELECT SCREEN
export class GameSelectScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {gamename: "gamename", gamedescription: "description", playersallowed: "Players:", adminnum: 0, selection: "lobby"};
  }

  componentDidMount() {
    $.callstatechangeall('msg', "Admin is Choosing...", "Game admin is choosing a game to play!");
    let clientsobj = $.returnAllPlayers();

    for (let key in clientsobj){
      if (clientsobj.hasOwnProperty(key)){
        let playerobj = clientsobj[key];
        if (playerobj.isadmin == true){
          //set adminnum
          this.state.adminnum = playerobj.playernum;
          $.callstatechangeprivate('vote', "Choose the game to play!", playerobj.socketid, "Illuminati Imposter,Assembly Line,Lobby");
        }
        //if no admin found then go back to lobby
      }
    }
    this.interval = setInterval(() => this.checkSelectedGame(), 500);
    $.resetReadyPlayers();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  updateSelection(){
    console.log("updateSelection" + $.retlastVote());
    if ($.retlastVote() != this.state.selection ){
      if ($.retlastVote() == 'Illuminati Imposter'){
        let descrip = 'In this game, you all ' +
        'belong to the Illuminati except for one player who is the Imposter.' +
        ' All of the Illuminati will receive the secret word. On the main ' +
        'screen, 4 words will be shown but only one of them will be the ' +
        'secret word. Players will have two rounds to draw pictures related ' +
        'to the secret word. Players will then vote on the Imposter. If the '+
        'Imposter is found out, they will have a final chance to win by '+
        'correctly choosing the secret word!';
        let players = 'Players: 4-8';
        this.setState({gamename: "Illuminati Imposter", gamedescription: descrip, playersallowed: players, adminnum: this.state.adminnum, selection: "Illuminati Imposter"});
      }
      else if ($.retlastVote() == 'Assembly Line'){
        let descrip = 'You belong to a team of ' +
        'robo-artists and your company manufactures paintings. Each member ' +
        'of your team will be drawing a part of the picture. Each robot will ' +
        'have a limited time to draw their part of the picture. The final ' +
        'robot manager will have to guess the correct word being drawn. The ' +
        'more points the better!';
        let players = 'Players: 2-10';
        this.setState({gamename: "Assembly Line", gamedescription: descrip, playersallowed: players, adminnum: this.state.adminnum, selection: "Assembly Line"});
      }
      else{
        this.setState({gamename: "", gamedescription: "Back To Lobby", playersallowed: "", adminnum: this.state.adminnum, selection: "lobby"});
      }
    }
  }

  checkSelectedGame(){
    this.updateSelection();
    //if ready then change the page
    if ($.isReadyPlayerNum(this.state.adminnum)){
      //go to voted game
      if ($.retlastVote() == "Illuminati Imposter"){
        if (ENVIRONMENT == "production"){
          if (($.returnAllPlayers().length >= 4) && ($.returnAllPlayers().length <= 8)){
            $.changeGameState($.retlastVote());
            this.props.history.push('/');
          }
          else {
            $.callstatechangeprivate('vote', "Not enough players!", playerobj.socketid, "Illuminati Imposter,Assembly Line,Lobby");
          }
        }
        else {
          $.changeGameState($.retlastVote());
          this.props.history.push('/');
        }

      }
      else{
        $.changeToLobby();
        $.callstatechangeall('draw', 'Draw something!');
        this.props.history.push('/');
      }

    }
  }

  render() {
    return (
      <div className="container-fluid gameselect">
      <div className="row justify-content-md-center">
       <div className="col-sm-6 gridcenter">
          <div id="selectgame">Select Game:
           <div id="gamelist">
               <GameSelection selection={this.state.selection} />
           </div>
          </div>

       </div>
       <div className="col-sm-6 gridcenter">
        <div id="aligndescrip">
          <img id="gamethumbnail" src="ruleslides/illumimposterthumb.png" height="100%" width="100%"></img>
          <div id="gamename">{this.state.gamename}</div>
          <div id="allowedplayers">{this.state.playersallowed}</div>
          <div id="gamedescription">{this.state.gamedescription}</div>
        </div>
       </div>
       </div>
     </div>
    );
  }
}

class GameSelection extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    //check last vote for selection
    if (this.props.selection == "Illuminati Imposter"){
      //make selection bold
      return (
        <ul>
          <li><b>Illuminati Imposter</b></li>
          <li>Assembly Line (In development)</li>
          <li>Lobby</li>
        </ul>
      );
    }
    else if (this.props.selection == "Assembly Line"){
      //make selection bold
      return (
        <ul>
          <li>Illuminati Imposter</li>
          <li><b>Assembly Line (In development)</b></li>
          <li>Lobby</li>
        </ul>
      );
    }
    else{
      //make selection bold
      return (
        <ul>
          <li>Illuminati Imposter</li>
          <li>Assembly Line (In development)</li>
          <li><b>Lobby</b></li>
        </ul>
      );
    }
  }
}
