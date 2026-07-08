/**
 * Lyrics Module
 * Handles lyrics data, rendering, active line highlighting, and auto-scrolling.
 */

const lyricsData = [
  { time: 0, text: "🎵 [Instrumen Intro]" },
  { time: 37.0, text: "Andai aku bisa" },
  { time: 44.5, text: "Memutar kembali" },
  { time: 49.5, text: "Waktu yang t'lah berjalan" },
  { time: 55.5, text: "'Tuk kembali bersama" },
  { time: 60.5, text: "Di dirimu s'lamanya..." },
  { time: 68.0, text: "Bukan maksud aku" },
  { time: 72.0, text: "Membawa dirimu" },
  { time: 78.0, text: "Masuk terlalu jauh" },
  { time: 83.0, text: "Ke dalam kisah cinta" },
  { time: 89.0, text: "Yang tak mungkin terjadi" },
  { time: 97.5, text: "Dan aku tak punya hati" },
  { time: 104.5, text: "Untuk menyakiti dirimu" },
  { time: 110.0, text: "Dan aku tak punya hati 'tuk mencintai" },
  { time: 119.0, text: "Dirimu yang s'lalu mencintai diriku" },
  { time: 126.0, text: "Walau kau tahu diriku masih bersamanya..." },
  { time: 138.5, text: "🎵 [Melodi Jeda]" },
  { time: 302.5, text: "Dan aku tak punya hati" },
  { time: 310.0, text: "Untuk menyakiti dirimu" },
  { time: 315.5, text: "Dan aku tak punya hati 'tuk mencintai" },
  { time: 324.5, text: "Dirimu yang s'lalu mencintai diriku" },
  { time: 331.5, text: "Walau kau tahu diriku masih bersamanya..." },
  { time: 352.0, text: "Walaupun kau tahu" },
  { time: 356.0, text: "Kau tahu diriku" },
  { time: 360.0, text: "Masih bersamanya..." },
  { time: 369.0, text: "🎵 [Instrumen Outro]" }
];

let lyricElements = [];
let activeLineIndex = -1;
let scrollContainer = null;
let timeOffset = 0; // Default synchronization offset in seconds

/**
 * Initializes and renders lyrics into the DOM container.
 * @param {HTMLElement} container - The wrapper element for the lyric lines.
 * @param {Function} onSeek - Callback invoked when a lyric line is clicked.
 */
function initLyrics(container, onSeek) {
  scrollContainer = container;
  container.innerHTML = "";
  lyricElements = [];
  activeLineIndex = -1;

  lyricsData.forEach((line, index) => {
    const div = document.createElement("div");
    div.className = "lyric-line";
    div.textContent = line.text;
    div.setAttribute("data-time", line.time);
    div.setAttribute("data-index", index);

    // Click to seek handler, accounting for timing offset
    div.addEventListener("click", () => {
      onSeek(line.time + timeOffset);
    });

    container.appendChild(div);
    lyricElements.push(div);
  });
}

/**
 * Updates the active lyric line based on current song playback time.
 * @param {number} currentTime - Current playback position in seconds.
 * @param {boolean} forceRefresh - If true, updates visually even if index hasn't changed.
 * @returns {number} The current active index.
 */
function updateActiveLyric(currentTime, forceRefresh = false) {
  if (!scrollContainer || lyricElements.length === 0) return -1;

  // Find the line that matches the current playback time (adjusted by offset)
  let newActiveIndex = -1;
  for (let i = 0; i < lyricsData.length; i++) {
    const adjustedTime = lyricsData[i].time + timeOffset;
    if (adjustedTime <= currentTime) {
      newActiveIndex = i;
    } else {
      break;
    }
  }

  // If the active line has changed, or we force refresh (on offset change)
  if (newActiveIndex !== activeLineIndex || forceRefresh) {
    if (activeLineIndex !== -1 && lyricElements[activeLineIndex]) {
      lyricElements[activeLineIndex].classList.remove("active");
    }
    
    activeLineIndex = newActiveIndex;

    if (activeLineIndex !== -1 && lyricElements[activeLineIndex]) {
      const activeEl = lyricElements[activeLineIndex];
      activeEl.classList.add("active");
      scrollToActiveLine(activeEl);
    }
  }

  return activeLineIndex;
}

/**
 * Scrolls the lyric container to center the active line.
 * @param {HTMLElement} activeEl - The currently active lyric line element.
 */
function scrollToActiveLine(activeEl) {
  if (!scrollContainer) return;
  
  const scrollBox = scrollContainer.parentElement; // #lyricsScrollBox
  if (!scrollBox) return;
  
  // Calculate top offset relative to the scroll box, regardless of CSS positioning
  const containerHeight = scrollBox.clientHeight;
  const activeOffsetTop = activeEl.getBoundingClientRect().top - scrollBox.getBoundingClientRect().top + scrollBox.scrollTop;
  const activeHeight = activeEl.clientHeight;
  
  // Center the active line
  const targetScrollTop = activeOffsetTop - (containerHeight / 2) + (activeHeight / 2);
  
  scrollBox.scrollTo({
    top: targetScrollTop,
    behavior: "smooth"
  });
}

/**
 * Updates the time offset and immediately triggers a refresh.
 * @param {number} offset - The new offset in seconds.
 * @param {number} currentTime - Current playback time to update visualization.
 */
function setTimeOffset(offset, currentTime) {
  timeOffset = offset;
  updateActiveLyric(currentTime, true);
}

// Export modules globally
window.LyricsManager = {
  init: initLyrics,
  update: updateActiveLyric,
  setOffset: setTimeOffset,
  getOffset: () => timeOffset,
  data: lyricsData
};
