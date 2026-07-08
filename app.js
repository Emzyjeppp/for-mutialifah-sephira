/**
 * Main Application Controller
 * Coordinates audio, lyrics, and user interface actions.
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements - Playback & Volume Controls
  const playBtn = document.getElementById("playBtn");
  const playIcon = playBtn.querySelector(".play-icon");
  const pauseIcon = playBtn.querySelector(".pause-icon");
  
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const muteBtn = document.getElementById("muteBtn");
  const volumeIcon = document.getElementById("volumeIcon");
  const volumeSlider = document.getElementById("volumeSlider");
  
  const modeBtn = document.getElementById("modeBtn");
  const modeStatus = document.getElementById("modeStatus");
  
  const progressBar = document.getElementById("progressBar");
  const sliderProgress = document.getElementById("sliderProgress");
  
  const currentTimeLabel = document.getElementById("currentTime");
  const totalDurationLabel = document.getElementById("totalDuration");
  
  // DOM Elements - Source Selection & Media Information
  const ytUrlInput = document.getElementById("ytUrlInput");
  const ytLoadBtn = document.getElementById("ytLoadBtn");
  const audioUpload = document.getElementById("audioUpload");
  const fileNameInfo = document.getElementById("fileNameInfo");
  
  const labelTitle = document.getElementById("labelTitle");
  const labelArtist = document.getElementById("labelArtist");
  
  // DOM Elements - Cassette Visuals
  const cassetteWrapper = document.getElementById("cassetteWrapper");
  const leftRoll = document.getElementById("leftRoll");
  const rightRoll = document.getElementById("rightRoll");
  
  // DOM Elements - Lyrics Card & Notifications
  const syncPrev = document.getElementById("syncPrev");
  const syncNext = document.getElementById("syncNext");
  const syncOffsetVal = document.getElementById("syncOffsetVal");
  
  const pulseIndicator = document.getElementById("pulseIndicator");
  const lyricsScrollBox = document.getElementById("lyricsScrollBox");
  const lyricsInner = document.getElementById("lyricsInner");
  const toast = document.getElementById("toast");

  // Setup Initial UI labels for YouTube Mode
  labelTitle.textContent = "Andai Aku Bisa";
  labelArtist.textContent = "Tulus (Tribute)";
  modeStatus.textContent = "YouTube Stream";
  fileNameInfo.textContent = "Audio: YouTube Stream";

  // Initialize Controllers
  const audio = new AudioController();
  
  // Initialize Lyrics Manager
  LyricsManager.init(lyricsInner, (time) => {
    audio.seek(time);
    showToast(`Melompat ke ${formatTime(time)}`);
  });

  // Setup Controller Callbacks
  audio.onDefaultFileLoaded = (sourceName) => {
    if (audio.mode === "youtube") {
      labelTitle.textContent = "Andai Aku Bisa";
      labelArtist.textContent = "Tulus (Tribute)";
      fileNameInfo.textContent = "Audio: YouTube Stream";
      modeStatus.textContent = "YouTube Stream";
    }
  };

  audio.onTimeUpdateCallback = (time) => {
    // 1. Update Labels & Progress
    currentTimeLabel.textContent = formatTime(time);
    const progressPercent = audio.duration > 0 ? (time / audio.duration) * 100 : 0;
    
    progressBar.value = progressPercent;
    sliderProgress.style.width = `${progressPercent}%`;

    // 2. Sync Lyrics
    LyricsManager.update(time);

    // 3. Update Cassette Tape rolls sizes dynamically based on progress
    const progress = audio.duration > 0 ? time / audio.duration : 0;
    const minRadius = 28;
    const maxRadius = 56;
    const delta = maxRadius - minRadius;
    
    const leftRadius = minRadius + delta * (1 - progress);
    const rightRadius = minRadius + delta * progress;
    
    leftRoll.style.setProperty("--left-tape-radius", `${leftRadius}px`);
    rightRoll.style.setProperty("--right-tape-radius", `${rightRadius}px`);
  };

  audio.onDurationChangeCallback = (duration) => {
    totalDurationLabel.textContent = formatTime(duration);
  };

  audio.onPlayStateChangeCallback = (isPlaying) => {
    if (isPlaying) {
      playIcon.classList.add("hidden");
      pauseIcon.classList.remove("hidden");
      pulseIndicator.classList.add("active");
      cassetteWrapper.style.setProperty("--rotate-speed", "2.5s");
    } else {
      playIcon.classList.remove("hidden");
      pauseIcon.classList.add("hidden");
      pulseIndicator.classList.remove("active");
      cassetteWrapper.style.setProperty("--rotate-speed", "0s");
    }
  };

  // UI Interactive Listeners
  playBtn.addEventListener("click", () => {
    if (audio.isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  });

  // Skip buttons (Rewind / Fast Forward 10s)
  prevBtn.addEventListener("click", () => {
    audio.seek(audio.currentTime - 10);
    showToast("Mundur 10 detik");
  });

  nextBtn.addEventListener("click", () => {
    audio.seek(audio.currentTime + 10);
    showToast("Maju 10 detik");
  });

  // Timeline dragging
  progressBar.addEventListener("input", (e) => {
    const targetPercent = parseFloat(e.target.value);
    const targetTime = (targetPercent / 100) * audio.duration;
    
    currentTimeLabel.textContent = formatTime(targetTime);
    sliderProgress.style.width = `${targetPercent}%`;
    
    audio.seek(targetTime);
  });

  // Mode Switcher (Cycles: YouTube -> Synth -> File -> YouTube)
  modeBtn.addEventListener("click", () => {
    if (audio.mode === "youtube") {
      audio.setMode("synth");
      modeStatus.textContent = "Demo Synth";
      labelTitle.textContent = "Andai Aku Bisa";
      labelArtist.textContent = "Tulus (Cover)";
      fileNameInfo.textContent = "Audio: Demo Synthesizer";
      showToast("Mode Audio: Demo Piano Sintetis");
    } else if (audio.mode === "synth") {
      // Check if file is loaded, else trigger file click
      if (audio.audioElement.src && !audio.audioElement.src.includes("error")) {
        audio.setMode("file");
        modeStatus.textContent = "Berkas Kustom";
        labelTitle.textContent = "Andai Aku Bisa";
        labelArtist.textContent = "Tulus (Virtual Collab)";
        fileNameInfo.textContent = "Andai Aku Bisa...mp3";
        showToast("Mode Audio: Berkas Kustom MP3");
      } else {
        audioUpload.click();
      }
    } else {
      audio.setMode("youtube");
      modeStatus.textContent = "YouTube Stream";
      labelTitle.textContent = "Andai Aku Bisa";
      labelArtist.textContent = "Tulus (Tribute)";
      fileNameInfo.textContent = "Audio: YouTube Stream";
      showToast("Mode Audio: YouTube Stream");
    }
  });

  // Volume slider
  volumeSlider.addEventListener("input", (e) => {
    const vol = parseFloat(e.target.value) / 100;
    audio.setVolume(vol);
    updateVolumeIcon(vol, audio.isMuted);
  });

  // Mute button
  muteBtn.addEventListener("click", () => {
    const isMuted = audio.toggleMute();
    updateVolumeIcon(audio.volume, isMuted);
    showToast(isMuted ? "Volume Senyap" : "Volume Aktif");
  });

  // Custom Audio Uploader
  audioUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fileNameInfo.textContent = file.name;
    const cleanName = file.name.replace(/\.[^/.]+$/, "");
    labelTitle.textContent = cleanName.substring(0, 22);
    labelArtist.textContent = "Berkas Lokal";

    audio.setFileSource(file);
    modeStatus.textContent = "Berkas Kustom";
    
    setTimeout(() => {
      audio.play();
    }, 150);

    showToast("Berkas audio berhasil dimuat!");
  });

  // Lyrics Timing Sync Adjuster
  let currentOffset = 0;

  syncPrev.addEventListener("click", () => {
    currentOffset -= 0.5;
    updateSyncOffset();
    showToast(`Lirik dipercepat 0.5s (Sync: ${currentOffset.toFixed(1)}s)`);
  });

  syncNext.addEventListener("click", () => {
    currentOffset += 0.5;
    updateSyncOffset();
    showToast(`Lirik diperlambat 0.5s (Sync: ${currentOffset.toFixed(1)}s)`);
  });

  function updateSyncOffset() {
    LyricsManager.setOffset(currentOffset, audio.currentTime);
    syncOffsetVal.textContent = `Sync: ${currentOffset > 0 ? '+' : ''}${currentOffset.toFixed(1)}s`;
  }

  // YouTube URL Loading
  function loadYoutubeUrl(url) {
    if (!url) return;
    
    // Regular expression to parse YouTube IDs (supports watch link, embed, and short link)
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      const videoId = match[2];
      audio.setYoutubeVideo(videoId);
      
      labelTitle.textContent = "YouTube Audio";
      labelArtist.textContent = "Loading...";
      fileNameInfo.textContent = `YT ID: ${videoId}`;
      modeStatus.textContent = "YouTube Stream";
      showToast("Memuat audio YouTube...");
    } else {
      showToast("Link YouTube tidak valid!");
    }
  }

  ytLoadBtn.addEventListener("click", () => {
    loadYoutubeUrl(ytUrlInput.value);
  });

  ytUrlInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      loadYoutubeUrl(ytUrlInput.value);
    }
  });

  // Helpers
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    
    if (window.toastTimeout) {
      clearTimeout(window.toastTimeout);
    }
    
    window.toastTimeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  }

  function updateVolumeIcon(vol, isMuted) {
    if (isMuted || vol <= 0.01) {
      volumeIcon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      `;
    } else if (vol < 0.5) {
      volumeIcon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      `;
    } else {
      volumeIcon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
      `;
    }
  }

  // Pre-load layout duration and load local file in background
  audio.onDurationChangeCallback(audio.duration);
  audio.loadDefaultFileIfExists();
});
