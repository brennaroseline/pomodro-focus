
/* =================================
   1. TIMER SETTINGS
================================= */

const durations = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
};

let currentMode = "focus";
let timeLeft = durations.focus;
let timerInterval = null;
let isRunning = false;


/* =================================
   2. CONNECT HTML ELEMENTS
================================= */

const timerDisplay = document.getElementById("timerDisplay");
const timerStatus = document.getElementById("timerStatus");
const timerCircle = document.getElementById("timerCircle");
const sessionTitle = document.getElementById("sessionTitle");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const modeButtons = document.querySelectorAll(".mode-btn");


/* =================================
   3. DATE AND STORAGE
================================= */

const today = new Date().toLocaleDateString("en-CA");

document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });

let stats = JSON.parse(
    localStorage.getItem("moriStats")
) || {
    totalMinutes: 0,
    totalSessions: 0,
    daily: {}
};

let todos = JSON.parse(
    localStorage.getItem("moriTodos")
) || [];

function saveStats() {
    localStorage.setItem(
        "moriStats",
        JSON.stringify(stats)
    );
}

function saveTodos() {
    localStorage.setItem(
        "moriTodos",
        JSON.stringify(todos)
    );
}


/* =================================
   4. TIMER DISPLAY
================================= */

function updateTimer() {

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

    const totalTime = durations[currentMode];

    const progress = timeLeft / totalTime;

    const degrees = progress * 360;

    timerCircle.style.background = `
        conic-gradient(
            var(--sage-dark) ${degrees}deg,
            var(--border) ${degrees}deg
        )
    `;

}


/* =================================
   5. CHANGE TIMER MODE
================================= */

function setMode(mode) {

    clearInterval(timerInterval);

    isRunning = false;
    currentMode = mode;
    timeLeft = durations[mode];

    modeButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.mode === mode
        );
    });

    if (mode === "focus") {
        sessionTitle.textContent = "Focus Session";
        timerStatus.textContent = "Ready when you are";
    }

    if (mode === "short") {
        sessionTitle.textContent = "Short Break";
        timerStatus.textContent = "Take a little rest";
    }

    if (mode === "long") {
        sessionTitle.textContent = "Long Break";
        timerStatus.textContent = "Relax and recharge";
    }

    startBtn.textContent =
        mode === "focus" ? "Start Focus" : "Start Break";

    updateTimer();

}

modeButtons.forEach(button => {

    button.addEventListener("click", () => {
        setMode(button.dataset.mode);
    });

});


/* =================================
   6. TIMER COUNTDOWN
================================= */

function completeTimer() {

    clearInterval(timerInterval);

    isRunning = false;
    timeLeft = 0;

    updateTimer();

    if (currentMode === "focus") {

        if (!stats.daily[today]) {
            stats.daily[today] = 0;
        }

        stats.daily[today] += 25;
        stats.totalMinutes += 25;
        stats.totalSessions += 1;

        saveStats();
        updateStatistics();

        timerStatus.textContent = "Focus completed! Well done 🌿";

    } else {

        timerStatus.textContent = "Break completed! Ready to focus?";

    }

    startBtn.textContent = "Start Again";

}


function startTimer() {

    if (isRunning) {

        clearInterval(timerInterval);
        isRunning = false;

        startBtn.textContent = "Resume";

        timerStatus.textContent = "Timer paused";

        return;
    }

    if (timeLeft <= 0) {
        timeLeft = durations[currentMode];
    }

    isRunning = true;

    startBtn.textContent = "Pause";
    timerStatus.textContent = "You are doing great!";

    timerInterval = setInterval(() => {

        timeLeft--;

        updateTimer();

        if (timeLeft <= 0) {
            completeTimer();
        }

    }, 1000);

}


function resetTimer() {

    clearInterval(timerInterval);

    isRunning = false;
    timeLeft = durations[currentMode];

    startBtn.textContent =
        currentMode === "focus" ? "Start Focus" : "Start Break";

    timerStatus.textContent = "Ready when you are";

    updateTimer();

}


startBtn.addEventListener("click", startTimer);

resetBtn.addEventListener("click", resetTimer);


/* =================================
   7. TO-DO LIST
================================= */

const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");


function renderTodos() {

    todoList.innerHTML = "";

    todos.forEach((todo, index) => {

        const item = document.createElement("li");

        item.className =
            todo.done ? "todo-item done" : "todo-item";

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = todo.done;

        checkbox.addEventListener("change", () => {

            todos[index].done = checkbox.checked;

            saveTodos();
            renderTodos();
            updateStatistics();

        });


        const text = document.createElement("span");

        text.textContent = todo.text;


        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-task";
        deleteButton.textContent = "×";
        deleteButton.setAttribute("aria-label", "Delete task");

        deleteButton.addEventListener("click", () => {

            todos.splice(index, 1);

            saveTodos();
            renderTodos();
            updateStatistics();

        });


        item.append(checkbox, text, deleteButton);

        todoList.appendChild(item);

    });


    const completed = todos.filter(
        todo => todo.done
    ).length;

    document.getElementById("todoSummary").textContent =
        `${completed} of ${todos.length} tasks completed`;

    document.getElementById("completedTasks").textContent =
        completed;

}


todoForm.addEventListener("submit", event => {

    event.preventDefault();

    const task = todoInput.value.trim();

    if (!task) return;

    todos.push({
        text: task,
        done: false
    });

    todoInput.value = "";

    saveTodos();
    renderTodos();
    updateStatistics();

});


/* =================================
   8. STUDY STATISTICS
================================= */

function updateStatistics() {

    const todayMinutes = stats.daily[today] || 0;

    document.getElementById("todayFocus").textContent =
        `${todayMinutes} min`;

    document.getElementById("totalFocus").textContent =
        `${stats.totalMinutes} min`;

    document.getElementById("totalSessions").textContent =
        stats.totalSessions;

    const completed = todos.filter(
        todo => todo.done
    ).length;

    document.getElementById("completedTasks").textContent =
        completed;

}



/* =================================
   9. MUSIC LIBRARY
================================= */

// Remember selected music platform

let currentPlatform = "youtube";


// Connect HTML elements

const musicTabs = document.querySelectorAll(".music-tab");

const musicForm = document.getElementById("musicForm");

const musicUrl = document.getElementById("musicUrl");

const musicPlayer = document.getElementById("musicPlayer");

const clearMusicBtn = document.getElementById("clearMusicBtn");


// Load saved playlists

let savedMusic = JSON.parse(
    localStorage.getItem("moriMusic")
) || {
    youtube: "",
    apple: ""
};


// Save playlist information

function saveMusic() {

    localStorage.setItem(
        "moriMusic",
        JSON.stringify(savedMusic)
    );

}


// Switch between platforms

function selectPlatform(platform) {

    currentPlatform = platform;

    musicTabs.forEach(tab => {

        tab.classList.toggle(
            "active",
            tab.dataset.platform === platform
        );

    });

    musicUrl.value = savedMusic[platform];

    musicUrl.placeholder =
        platform === "youtube"
            ? "Paste YouTube playlist link"
            : "Paste Apple Music playlist link";

    showEmptyMusic();

}


// Show empty music screen

function showEmptyMusic() {

    musicPlayer.innerHTML = `
        <div class="music-empty">
            <span>♫</span>
            <p>Your peaceful music space</p>
            <small>Load your favorite playlist here.</small>
        </div>
    `;

}


// Create YouTube playlist player

function createYouTubePlayer(link) {

    const url = new URL(link);

    const allowedHosts = [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "music.youtube.com"
    ];

    if (!allowedHosts.includes(url.hostname)) {
        throw new Error("Please enter a valid YouTube link.");
    }

    const playlistId = url.searchParams.get("list");

    if (!playlistId) {
        throw new Error("Please use a YouTube playlist link.");
    }

    const embedUrl =
        "https://www.youtube.com/embed/videoseries?list=" +
        encodeURIComponent(playlistId);

    return {
        src: embedUrl,
        type: "youtube"
    };

}


// Create Apple Music player

function createApplePlayer(link) {

    const url = new URL(link);

    const allowedHosts = [
        "music.apple.com",
        "www.music.apple.com",
        "embed.music.apple.com"
    ];

    if (!allowedHosts.includes(url.hostname)) {
        throw new Error("Please enter a valid Apple Music link.");
    }

    if (!url.pathname.includes("/playlist/")) {
        throw new Error("Please use an Apple Music playlist link.");
    }

    url.hostname = "embed.music.apple.com";

    return {
        src: url.toString(),
        type: "apple"
    };

}


// Display selected playlist

function loadPlaylist(link) {

    try {

        const playerData =
            currentPlatform === "youtube"
                ? createYouTubePlayer(link)
                : createApplePlayer(link);

        musicPlayer.innerHTML = "";

        const player = document.createElement("iframe");

        player.src = playerData.src;

        player.title =
            currentPlatform === "youtube"
                ? "YouTube Music Playlist"
                : "Apple Music Playlist";

        player.className =
            playerData.type === "youtube"
                ? "youtube-player"
                : "apple-player";

        player.allow =
            "autoplay; encrypted-media; fullscreen; picture-in-picture";

        player.allowFullscreen = true;

        musicPlayer.appendChild(player);

        savedMusic[currentPlatform] = link;

        saveMusic();

    } catch (error) {

        alert(error.message);

    }

}


// Listen to platform selection

musicTabs.forEach(tab => {

    tab.addEventListener("click", () => {

        selectPlatform(tab.dataset.platform);

    });

});


// Listen to playlist submission

musicForm.addEventListener("submit", event => {

    event.preventDefault();

    const link = musicUrl.value.trim();

    if (!link) return;

    loadPlaylist(link);

});


// Clear current playlist

clearMusicBtn.addEventListener("click", () => {

    savedMusic[currentPlatform] = "";

    saveMusic();

    musicUrl.value = "";

    showEmptyMusic();

});


// Restore saved playlist on startup

function restoreMusic() {

    const lastPlatform =
        localStorage.getItem("moriMusicPlatform") || "youtube";

    selectPlatform(lastPlatform);

    if (savedMusic[lastPlatform]) {

        loadPlaylist(savedMusic[lastPlatform]);

    }

}


// Save platform selection

musicTabs.forEach(tab => {

    tab.addEventListener("click", () => {

        localStorage.setItem(
            "moriMusicPlatform",
            tab.dataset.platform
        );

    });

});

updateTimer();

renderTodos();

updateStatistics();

restoreMusic();