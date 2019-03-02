import React, { Component } from "react";
import albumData from "./../data/albums";
import PlayerBar from "./PlayerBar";
import { Columns } from "react-bulma-components/full";
import { Card } from "react-bulma-components/full";

class Album extends Component {
  constructor(props) {
    super(props);

    const album = albumData.find(a => {
      return a.slug === this.props.match.params.slug;
    });

    this.state = {
      album: album,
      currentSong: album.songs[0],
      currentTime: 0,
      duration: album.songs[0].duration,
      isPlaying: false,
      volume: 0
    };

    this.audioElement = document.createElement("audio");
    this.audioElement.src = album.songs[0].audioSrc;
  }

  componentDidMount() {
    this.eventListeners = {
      timeupdate: e => {
        this.setState({
          currentTime: this.audioElement.currentTime
        });
      },
      durationchange: e => {
        this.setState({ duration: this.audioElement.duration });
      },
      volumechange: e => {
        this.setState({ volume: this.audioElement.volume });
      }
    };
    this.audioElement.addEventListener(
      "timeupdate",
      this.eventListeners.timeupdate
    );
    this.audioElement.addEventListener(
      "durationchange",
      this.eventListeners.durationchange
    );
    this.audioElement.addEventListener(
      "volumechange",
      this.eventListeners.volumechange
    );
  }

  componentWillUnmount() {
    this.audioElement.src = null;
    this.audioElement.removeEventListener(
      "timeupdate",
      this.eventListeners.timeupdate
    );
    this.audioElement.removeEventListener(
      "durationchange",
      this.eventListeners.durationchange
    );
  }

  play() {
    this.audioElement.play();
    this.setState({ isPlaying: true });
  }

  pause() {
    this.audioElement.pause();
    this.setState({ isPlaying: false });
  }

  setSong(song) {
    this.audioElement.src = song.audioSrc;
    this.setState({ currentSong: song });
  }

  handleSongClick(song) {
    const isSameSong = this.state.currentSong === song;
    if (this.state.isPlaying && isSameSong) {
      this.pause();
    } else {
      if (!isSameSong) {
        this.setSong(song);
      }
      this.play();
    }
  }

  mouseEnter(song) {
    this.setState({ hoveredSong: song });
  }

  handlePrevClick() {
    const currentIndex = this.state.album.songs.findIndex(
      song => this.state.currentSong === song
    );
    const newIndex = Math.max(0, currentIndex - 1);
    const newSong = this.state.album.songs[newIndex];
    this.setSong(newSong);
    this.play();
  }

  handleNextClick() {
    const songs = this.state.album.songs;
    const currentIndex = this.state.album.songs.findIndex(
      song => this.state.currentSong === song
    );
    const newIndex = (currentIndex + 1) % songs.length;
    const newSong = this.state.album.songs[newIndex];
    this.setSong(newSong);
    this.play();
  }

  handleTimeChange(e) {
    const newTime = this.audioElement.duration * e.target.value;
    this.audioElement.currentTime = newTime;
    this.setState({ currentTime: newTime });
  }

  handleVolumeChange(e) {
    const newVolume = e.target.value;
    this.audioElement.volume = newVolume;
    this.setState({ volume: newVolume });
  }

  formatTime(timestamp) {
    let minutes = Math.floor(timestamp / 60);
    let seconds = timestamp - minutes * 60;
    if (seconds < 10) {
      seconds = "0" + seconds.toFixed();
    } else {
      seconds = seconds.toFixed();
    }
    timestamp = minutes + ":" + seconds;
    return timestamp;
  }

  render() {
    return (
      <section className="album">
        <section id="album-info">
          <Columns>
            <Columns.Column size="one-third">
              <Card backgroundColor="#ffffff10">
                <Card.Image
                  id="album-cover-art"
                  src={this.state.album.albumCover}
                  alt={this.state.album.title}
                />
                <Card.Content>
                  <div className="album-details">
                    <h1 id="album-title">{this.state.album.title}</h1>
                    <h2 className="artist">{this.state.album.artist}</h2>
                    <div id="release-info">{this.state.album.releaseInfo}</div>
                  </div>
                </Card.Content>
              </Card>
            </Columns.Column>
            <Columns.Column narrow>
              <table id="song-list" className="table is-hoverable">
                <colgroup>
                  <col id="song-number-column" />
                  <col id="song-title-column" />
                  <col id="song-duration-column" />
                </colgroup>
                <tbody>
                  {this.state.album.songs.map((song, index) => {
                    let icon;
                    const isCurrentSong = this.state.currentSong === song;
                    const isHoveredSong = this.state.hoveredSong === song;
                    if (isCurrentSong && this.state.isPlaying) {
                      icon = <span className="icon ion-md-pause" />;
                    } else if (isHoveredSong) {
                      icon = <span className="icon ion-md-play-circle" />;
                    } else {
                      icon = index + 1;
                    }

                    return (
                      <tr
                        className="song"
                        key={index}
                        onClick={() => this.handleSongClick(song)}
                        onMouseEnter={() => this.mouseEnter(song)}
                      >
                        <td>
                          <div>{icon}</div>
                        </td>
                        <td>{song.title}</td>
                        <td>{this.formatTime(song.duration)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Columns.Column>
          </Columns>
        </section>

        <PlayerBar
          isPlaying={this.state.isPlaying}
          currentSong={this.state.currentSong}
          currentTime={this.state.currentTime}
          duration={this.state.duration}
          handleSongClick={() => this.handleSongClick(this.state.currentSong)}
          handlePrevClick={() => this.handlePrevClick()}
          handleNextClick={() => this.handleNextClick()}
          handleTimeChange={e => this.handleTimeChange(e)}
          handleVolumeChange={e => this.handleVolumeChange(e)}
          formatTime={timestamp => this.formatTime(timestamp)}
        />
      </section>
    );
  }
}
export default Album;
