import * as env from './env';
import ReactHowler from 'react-howler'

const ENVIRONMENT = env.ENVIRONMENT;
const GAMELISTSTRING = "Illuminati Imposter,Assembly Line,Favorite Picture,Lobby";
//GAME SELECT SCREEN
export class Announcer extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      playing: true,
      loaded: false,
      loop: false,
      mute: false,
      volume: 1.0
    };
  }

  handleOnLoad () {
     this.setState({
       loaded: true,
       duration: this.player.duration()
     })
   }

   handleOnPlay () {
     this.setState({
       playing: true
     })
   }

  handleOnEnd () {
     this.setState({
       playing: false
     })
  }


  render() {
    return (
      <div>
        <ReactHowler
            src={['sound/minigameonerulesv1.ogg', 'sound/minigameonerulesv1.mp3']}
            preload={true}
            playing={this.state.playing}
            loop={this.state.loop}
            mute={this.state.mute}
            volume={this.state.volume}
            onLoad={this.handleOnLoad}
            onPlay={this.handleOnPlay}
            onEnd={this.handleOnEnd}
        />
      </div>
    );
  }
}
