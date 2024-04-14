console.log("Script Initializing ...");
let currentsong = new Audio();
let songs;
function formatTime(seconds) {
  seconds = Math.round(seconds);
  // Calculate minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Add leading zeros to minutes and seconds if needed
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const formattedSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;

  // Combine formatted minutes and seconds in "00:00" format
  const formattedTime = `${formattedMinutes}:${formattedSeconds}`;

  return formattedTime;
}

async function getSongs() {
  let a = await fetch("http://127.0.0.1:5500/Songs/");
  let response = await a.text();
  // console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  let songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split("/Songs/")[1]);
    }
  }
  return songs;
}

const playMusic = (track) => {
  // let audio = new Audio("/Songs/" + track);
  currentsong.src = "/Songs/" + track;
  currentsong.play();
  play.src = "SVGs/pause.svg";
  document.querySelector(".moving-text").innerHTML = track;
  document.querySelector(".currentDuration").innerHTML = "00:00";
  document.querySelector(".totalDuration").innerHTML = "00:00";
};

async function main() {
  songs = await getSongs();
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  for (const song of songs) {
    let decoded = decodeURIComponent(song);
    songUL.innerHTML =
      songUL.innerHTML +
      `<li> <img class="invert" src="SVGs/music.svg" alt="Music">
        <div class="info">
            <div>${decoded}</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="SVGs/play.svg" alt="play">
        </div>        
        </li>`;
  }

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((li) => {
    li.addEventListener("click", () => {
      console.log(li.querySelector(".info").firstElementChild.innerHTML);
      playMusic(li.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "SVGs/pause.svg";
    } else {
      currentsong.pause();
      play.src = "SVGs/play.svg";
    }
  });

  currentsong.addEventListener("timeupdate", () => {
    // console.log(currentsong.currentTime, currentsong.duration);
    const currentTime = currentsong.currentTime;
    const duration = currentsong.duration;

    const songTimeElement1 = document.querySelector(".currentDuration");
    if (!isNaN(currentTime) && !isNaN(duration)) {
      songTimeElement1.innerHTML = `${formatTime(currentTime)}`;
    }
    const songTimeElement2 = document.querySelector(".totalDuration");
    if (!isNaN(currentTime) && !isNaN(duration)) {
      songTimeElement2.innerHTML = `${formatTime(duration)}`;
    }
    const progress = (currentTime / duration) * 100;
    document.querySelector(".gola").style.left = `${progress}%`;
    document.querySelector(".gola-se-pehle").style.width = `${progress}%`;
  });

  const seekbar = document.querySelector(".seekbar");
  const gola = document.querySelector(".gola");
  const golaSePehle = document.querySelector(".gola-se-pehle");

  seekbar.addEventListener("click", (e) => {
    e.preventDefault();

    const seekbarWidth = seekbar.getBoundingClientRect().width;
    const clickPosition = e.clientX - seekbar.getBoundingClientRect().left;
    const progressPercentage = (clickPosition / seekbarWidth) * 100;

    gola.style.left = progressPercentage + "%";
    golaSePehle.style.width = progressPercentage + "%";

    const seekTime = (clickPosition / seekbarWidth) * currentsong.duration;
    currentsong.currentTime = seekTime;
  });

  currentsong.addEventListener("timeupdate", () => {
    const currentTime = currentsong.currentTime;
    const duration = currentsong.duration;
    const progressPercentage = (currentTime / duration) * 100;

    gola.style.left = progressPercentage + "%";
    golaSePehle.style.width = progressPercentage + "%";
  });

  let isDragging = false;
  function updateSeekbarAndAudio(clickX) {
    const seekbarWidth = seekbar.getBoundingClientRect().width;
    const progressPercentage = (clickX / seekbarWidth) * 100;

    gola.style.left = progressPercentage + "%";
    golaSePehle.style.width = progressPercentage + "%";

    const seekTime = (clickX / seekbarWidth) * currentsong.duration;
    currentsong.currentTime = seekTime;
  }

  gola.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDragging = true;
  });

  // Mouse move event listener to update seekbar during dragging
  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const seekbarRect = seekbar.getBoundingClientRect();
      let clickX = e.clientX - seekbarRect.left;
      clickX = Math.max(0, Math.min(clickX, seekbarRect.width)); // Ensure within seekbar bounds
      updateSeekbarAndAudio(clickX);
    }
  });

  // Mouse up event listener to end dragging
  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
    }
  });

  // Update seekbar position during audio playback
  currentsong.addEventListener("timeupdate", () => {
    if (!isDragging) {
      const currentTime = currentsong.currentTime;
      const duration = currentsong.duration;
      const progressPercentage = (currentTime / duration) * 100;

      gola.style.left = progressPercentage + "%";
      golaSePehle.style.width = progressPercentage + "%";
    }
  });

  let currentSongIndex = 0;
  const previousButton = document.getElementById("previous");
  const nextButton = document.getElementById("next");
  previousButton.addEventListener("click", playPreviousSong);
  nextButton.addEventListener("click", playNextSong);
  function playPreviousSong() {
    currentSongIndex--;
    if (currentSongIndex < 0) {
      currentSongIndex = songs.length - 1;
    }
    playSongAtIndex(currentSongIndex);
  }
  function playNextSong() {
    currentSongIndex++;
    if (currentSongIndex >= songs.length) {
      currentSongIndex = 0;
    }
    playSongAtIndex(currentSongIndex);
  }

  function playSongAtIndex(index) {
    const songUrl = songs[index];
    playMusic(decodeURIComponent(songUrl));
    console.log("Playing:", songUrl);
  }

  //volume
  const rangeInput = document.querySelector(".range").getElementsByTagName("input")[0];
  const volumeStep = 7;
  rangeInput.addEventListener("wheel", (e) => {
      e.preventDefault();
      const scrollDirection = e.deltaY < 0 ? "up" : "down";
      if (scrollDirection === "up") {
          if (parseInt(rangeInput.value) < 100) {
              rangeInput.value = parseInt(rangeInput.value) + volumeStep;
              currentsong.volume = parseInt(rangeInput.value) / 100;
          }
      } else {
          if (parseInt(rangeInput.value) > 0) {
              rangeInput.value = parseInt(rangeInput.value) - volumeStep;
              currentsong.volume = parseInt(rangeInput.value) / 100;
          }
      }
  });
  rangeInput.addEventListener("input", (e) => {
      currentsong.volume = parseInt(e.target.value) / 100;
  });
}

main();
