/**
 * Audio Controller Module
 * Handles HTML5 Audio (local files), Web Audio API (Synthesizer), and YouTube Player API.
 */

// Frequency lookup table for notes
const NOTE_FREQS = {
  'C3': 130.81, 'E3': 164.81, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99
};

// Simplified chord progression timed for "Andai Aku Bisa"
const synthChords = [
  { time: 0, notes: ['C3', 'E4', 'G4', 'C5'] },       // C Intro
  { time: 4, notes: ['B3', 'D4', 'G4', 'B4'] },       // G/B
  { time: 8, notes: ['A3', 'C4', 'E4', 'A4'] },       // Am
  { time: 12, notes: ['G3', 'C4', 'E4', 'G4'] },      // C/G
  { time: 16, notes: ['F3', 'A3', 'C4', 'F4'] },      // F
  { time: 20, notes: ['E3', 'G3', 'C4', 'E4'] },      // C/E
  { time: 24, notes: ['D3', 'F3', 'A3', 'D4'] },      // Dm
  { time: 28, notes: ['G3', 'B3', 'D4', 'G4'] },      // G
  
  // Verse 1 (00:37.0 - "Andai aku bisa...")
  { time: 37.0, notes: ['C3', 'E4', 'G4', 'C5'] },
  { time: 40.5, notes: ['B3', 'D4', 'G4', 'B4'] },
  { time: 44.5, notes: ['A3', 'C4', 'E4', 'A4'] },
  { time: 49.5, notes: ['F3', 'A3', 'C4', 'F4'] },
  { time: 53.5, notes: ['G3', 'B3', 'D4', 'G4'] },
  { time: 56.5, notes: ['F3', 'A3', 'C4', 'F4'] },
  { time: 60.5, notes: ['G3', 'B3', 'D4', 'G4'] },
  { time: 64.5, notes: ['C3', 'E4', 'G4', 'C5'] },
  
  // Verse 2
  { time: 68.0, notes: ['C3', 'E4', 'G4', 'C5'] },    
  { time: 72.0, notes: ['B3', 'D4', 'G4', 'B4'] },      
  { time: 78.0, notes: ['A3', 'C4', 'E4', 'A4'] },      
  { time: 83.0, notes: ['F3', 'A3', 'C4', 'F4'] },      
  { time: 89.0, notes: ['G3', 'B3', 'D4', 'G4'] },      
  { time: 93.0, notes: ['F3', 'A3', 'C4', 'F4'] },      
  { time: 97.5, notes: ['G3', 'B3', 'D4', 'G4'] },      
  { time: 104.5, notes: ['C3', 'E4', 'G4', 'C5'] },      
  
  // Chorus 1
  { time: 110, notes: ['F3', 'A3', 'C4', 'F4'] },      
  { time: 114, notes: ['G3', 'B3', 'D4', 'G4'] },      
  { time: 119, notes: ['E3', 'G3', 'C4', 'E4'] },     
  { time: 123, notes: ['A3', 'C4', 'E4', 'A4'] },     
  { time: 126.0, notes: ['F3', 'A3', 'C4', 'F4'] },   
  { time: 130.0, notes: ['G3', 'B3', 'D4', 'G4'] },   
  { time: 138.5, notes: ['E3', 'G3', 'C4', 'E4'] }
];

class AudioController {
  constructor() {
    this.mode = 'youtube'; // Default mode is 'youtube'
    this.isPlaying = false;
    this.duration = 238; // Default mock duration
    this.currentTime = 0;
    this.volume = 0.8;
    this.isMuted = false;
    
    // File Audio Element
    this.audioElement = new Audio();
    this.audioElement.volume = this.volume;
    
    // YouTube API State
    this.ytPlayer = null;
    this.ytVideoId = 'ew3lh7_DAeU'; // Default Tulus video ID
    this.isYtReady = false;
    
    // Web Audio API context
    this.audioContext = null;
    this.synthInterval = null;
    this.lastTriggeredTime = -1;
    this.simulatedTimer = null;
    this.fileInterval = null;
    this.ytInterval = null;
    
    // Callback registers
    this.onTimeUpdateCallback = null;
    this.onDurationChangeCallback = null;
    this.onPlayStateChangeCallback = null;
    this.onDefaultFileLoaded = null; // Fired when default source successfully loads
    
    // Initialize YouTube API player
    this.initYouTubePlayer();
  }

  initContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  initYouTubePlayer() {
    const createPlayer = () => {
      this.ytPlayer = new YT.Player('ytPlayerContainer', {
        height: '1',
        width: '1',
        videoId: this.ytVideoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3
        },
        events: {
          onReady: () => {
            this.isYtReady = true;
            this.duration = this.ytPlayer.getDuration() || 238;
            if (this.mode === 'youtube' && this.onDurationChangeCallback) {
              this.onDurationChangeCallback(this.duration);
            }
            if (this.mode === 'youtube' && this.onDefaultFileLoaded) {
              this.onDefaultFileLoaded("YouTube Audio Stream");
            }
          },
          onStateChange: (event) => {
            // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
            if (event.data === 1) {
              this.isPlaying = true;
              this.startYtTracker();
              if (this.onPlayStateChangeCallback) this.onPlayStateChangeCallback(true);
            } else {
              this.isPlaying = false;
              this.stopYtTracker();
              if (this.onPlayStateChangeCallback) this.onPlayStateChangeCallback(false);
              
              if (event.data === 0) { // ENDED
                this.seek(0);
              }
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      if (!document.getElementById('yt-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api';
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
      
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        createPlayer();
      };
    }
  }

  setMode(mode) {
    if (this.mode === mode) return;
    this.pause();
    this.mode = mode;
    this.currentTime = 0;
    
    if (this.mode === 'synth') {
      this.duration = 238;
      if (this.onDurationChangeCallback) this.onDurationChangeCallback(this.duration);
      if (this.onTimeUpdateCallback) this.onTimeUpdateCallback(0);
    } else if (this.mode === 'file') {
      this.duration = this.audioElement.duration || 0;
      if (this.onDurationChangeCallback) this.onDurationChangeCallback(this.duration);
      if (this.onTimeUpdateCallback) this.onTimeUpdateCallback(this.audioElement.currentTime);
    } else if (this.mode === 'youtube') {
      this.duration = this.isYtReady && this.ytPlayer ? this.ytPlayer.getDuration() : 238;
      if (this.onDurationChangeCallback) this.onDurationChangeCallback(this.duration);
      if (this.onTimeUpdateCallback) this.onTimeUpdateCallback(this.currentTime);
    }
  }

  setFileSource(file) {
    const fileURL = URL.createObjectURL(file);
    this.audioElement.src = fileURL;
    this.audioElement.load();
    this.setMode('file');
    
    this.audioElement.onloadedmetadata = () => {
      this.duration = this.audioElement.duration;
      if (this.onDurationChangeCallback) {
        this.onDurationChangeCallback(this.duration);
      }
    };
  }

  setYoutubeVideo(videoId) {
    this.ytVideoId = videoId;
    this.setMode('youtube');
    if (this.isYtReady && this.ytPlayer) {
      this.ytPlayer.cueVideoById(this.ytVideoId);
      // Brief delay to retrieve duration of new video
      setTimeout(() => {
        this.duration = this.ytPlayer.getDuration() || 238;
        if (this.onDurationChangeCallback) {
          this.onDurationChangeCallback(this.duration);
        }
      }, 600);
    }
  }

  loadDefaultFileIfExists() {
    // Attempt to load the local MP3 file as an option in the background
    this.defaultFile = "Andai Aku Bisa - Tulus, Erwin Gutawa Orchestra, Hasna Mufida (Virtual Collaboration).mp3";
    this.audioElement.src = encodeURI(this.defaultFile);
    this.audioElement.load();
    
    this.audioElement.addEventListener('loadedmetadata', () => {
      // If user switches to 'file' mode, metadata is ready
      if (this.mode === 'file') {
        this.duration = this.audioElement.duration;
        if (this.onDurationChangeCallback) this.onDurationChangeCallback(this.duration);
      }
    }, { once: true });

    this.audioElement.addEventListener('error', () => {
      // Graceful ignore: YouTube mode remains active
    }, { once: true });
  }

  play() {
    if (this.isPlaying) return;
    this.initContext();

    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    if (this.mode === 'file') {
      this.isPlaying = true;
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
      this.audioElement.play().catch(err => {
        console.warn("Audio element play failed:", err);
      });
      this.startFileTracker();
      if (this.onPlayStateChangeCallback) this.onPlayStateChangeCallback(true);
    } else if (this.mode === 'youtube') {
      if (this.isYtReady && this.ytPlayer) {
        this.ytPlayer.setVolume(this.isMuted ? 0 : this.volume * 100);
        this.ytPlayer.playVideo();
      }
    } else {
      this.isPlaying = true;
      this.startSynthTracker();
      if (this.onPlayStateChangeCallback) this.onPlayStateChangeCallback(true);
    }
  }

  pause() {
    if (!this.isPlaying) return;

    if (this.mode === 'file') {
      this.isPlaying = false;
      this.audioElement.pause();
      this.stopFileTracker();
      if (this.onPlayStateChangeCallback) this.onPlayStateChangeCallback(false);
    } else if (this.mode === 'youtube') {
      if (this.isYtReady && this.ytPlayer) {
        this.ytPlayer.pauseVideo();
      }
    } else {
      this.isPlaying = false;
      this.stopSynthTracker();
      if (this.onPlayStateChangeCallback) this.onPlayStateChangeCallback(false);
    }
  }

  seek(seconds) {
    this.currentTime = Math.max(0, Math.min(seconds, this.duration));
    this.lastTriggeredTime = -1; // Reset synth chords tracking
    
    if (this.mode === 'file') {
      this.audioElement.currentTime = this.currentTime;
    } else if (this.mode === 'youtube') {
      if (this.isYtReady && this.ytPlayer) {
        this.ytPlayer.seekTo(this.currentTime, true);
      }
    } else {
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.currentTime);
      }
      if (this.isPlaying) {
        this.playSynthChordAtCurrentTime();
      }
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(val, 1));
    this.audioElement.volume = this.isMuted ? 0 : this.volume;
    if (this.isYtReady && this.ytPlayer) {
      this.ytPlayer.setVolume(this.isMuted ? 0 : this.volume * 100);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audioElement.volume = this.isMuted ? 0 : this.volume;
    if (this.isYtReady && this.ytPlayer) {
      if (this.isMuted) {
        this.ytPlayer.mute();
      } else {
        this.ytPlayer.unMute();
        this.ytPlayer.setVolume(this.volume * 100);
      }
    }
    return this.isMuted;
  }

  /* File Audio Tracker */
  startFileTracker() {
    this.stopFileTracker();
    this.fileInterval = setInterval(() => {
      this.currentTime = this.audioElement.currentTime;
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.currentTime);
      }
      if (this.audioElement.ended) {
        this.pause();
        this.seek(0);
      }
    }, 100);
  }

  stopFileTracker() {
    if (this.fileInterval) {
      clearInterval(this.fileInterval);
      this.fileInterval = null;
    }
  }

  /* YouTube Audio Tracker */
  startYtTracker() {
    this.stopYtTracker();
    this.ytInterval = setInterval(() => {
      if (this.isYtReady && this.ytPlayer) {
        this.currentTime = this.ytPlayer.getCurrentTime() || 0;
        if (this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(this.currentTime);
        }
      }
    }, 100);
  }

  stopYtTracker() {
    if (this.ytInterval) {
      clearInterval(this.ytInterval);
      this.ytInterval = null;
    }
  }

  /* Web Audio Synthesizer Engine */
  startSynthTracker() {
    this.stopSynthTracker();
    this.playSynthChordAtCurrentTime();
    
    const tickMs = 100;
    this.simulatedTimer = setInterval(() => {
      this.currentTime += tickMs / 1000;
      if (this.currentTime >= this.duration) {
        this.pause();
        this.seek(0);
        return;
      }
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.currentTime);
      }
      this.checkAndPlaySynthChords();
    }, tickMs);
  }

  stopSynthTracker() {
    if (this.simulatedTimer) {
      clearInterval(this.simulatedTimer);
      this.simulatedTimer = null;
    }
  }

  checkAndPlaySynthChords() {
    let activeChord = null;
    for (let i = 0; i < synthChords.length; i++) {
      if (synthChords[i].time <= this.currentTime) {
        activeChord = synthChords[i];
      } else {
        break;
      }
    }
    if (activeChord && activeChord.time !== this.lastTriggeredTime) {
      this.lastTriggeredTime = activeChord.time;
      this.playSynthChord(activeChord.notes);
    }
  }

  playSynthChordAtCurrentTime() {
    let activeChord = null;
    for (let i = 0; i < synthChords.length; i++) {
      if (synthChords[i].time <= this.currentTime) {
        activeChord = synthChords[i];
      } else {
        break;
      }
    }
    if (activeChord) {
      this.lastTriggeredTime = activeChord.time;
      this.playSynthChord(activeChord.notes);
    }
  }

  playSynthChord(notes) {
    if (!this.audioContext || this.isMuted || this.volume <= 0.01) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.18, now);
    masterGain.connect(ctx.destination);

    notes.forEach((note) => {
      const freq = NOTE_FREQS[note];
      if (!freq) return;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const subOsc = ctx.createOscillator();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(freq * 0.5, now);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, now);
      
      gainNode.gain.linearRampToValueAtTime(0.7, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.35, now + 0.8);
      gainNode.gain.setValueAtTime(0.35, now + 2.5);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

      osc.connect(gainNode);
      subOsc.connect(gainNode);
      gainNode.connect(masterGain);

      osc.start(now);
      subOsc.start(now);
      
      osc.stop(now + 3.3);
      subOsc.stop(now + 3.3);
    });
  }
}

// Export controller globally
window.AudioController = AudioController;
