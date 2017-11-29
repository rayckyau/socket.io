//GAME SELECT SCREEN
export class GameSelectScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {gamedescription: "description", adminnum: 0};
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
    this.interval = setInterval(() => this.checkSelectedGame(), 1000);
    $.resetReadyPlayers();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  checkSelectedGame(){
    //check last vote for selection
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
             <ul>
               <li>Coffee</li>
               <li>Tea</li>
               <li>Milk</li>
             </ul>
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
