//GAME SELECT SCREEN
export class GameSelectScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {gamedescription: "description", adminnum: 0, selection: "lobby"};
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
          $.callstatechangeprivate('vote', "Choose the game to play!", playerobj.socketid, "minigameone,minigametwo,Lobby");
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
      if ($.retlastVote() == 'minigameone'){
        let descrip = "This is minigameone."
        this.setState({gamedescription: descrip, adminnum: this.state.adminnum, selection: "minigameone"});
      }
      else{
        this.setState({gamedescription: "Back To Lobby", adminnum: this.state.adminnum, selection: "lobby"})
      }
    }
  }

  checkSelectedGame(){
    this.updateSelection();
    //if ready then change the page
    if ($.isReadyPlayerNum(this.state.adminnum)){
      //go to voted game
      if ($.retlastVote() == "minigameone"){
        $.changeGameState($.retlastVote());
        this.props.history.push('/');
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
      <div className="container-fluid">
      <div className="row justify-content-md-center">
       <div className="col-sm-6 gridcenter">
          <div id="selectgame">Select:
           <div id="gamelist">
               <GameSelection selection={this.state.selection} />
           </div>
          </div>

       </div>
       <div className="col-sm-6">
          <div id="gamethumbnail">
          </div>
          <div id="gamedescription">{this.state.gamedescription}</div>
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
    if (this.props.selection == "minigameone"){
      //make selection bold
      return (
        <ul>
          <li><b>minigameone</b></li>
          <li>minigametwo</li>
          <li>back to lobby</li>
        </ul>
      )
    }
    else{
      //make selection bold
      return (
        <ul>
          <li>minigameone</li>
          <li>minigametwo</li>
          <li><b>back to lobby</b></li>
        </ul>
      )
    }
  }
}
