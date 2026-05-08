const playerData = { track: null, artist: null, state: 0, position: 0, duration: 0 };

function buildProgressBar(position, duration) {
    if (!duration) return '[──────────────────]';
    const filled = Math.round(Math.min(position / duration, 1) * 18);
    return '[' + '█'.repeat(filled) + '░'.repeat(18 - filled) + ']';
}

function formatTime(seconds) {
    if (!seconds && seconds !== 0) return '—:——';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

function updateStatusLeft() {
    if (!playerData.track || playerData.state === 0) {
        $('#status-left').text('');
        return;
    }
    const icon = playerData.state === 2 ? '⏸' : '♪';
    $('#status-left').text(`${icon}  ${playerData.track}  —  ${playerData.artist}  ${buildProgressBar(playerData.position, playerData.duration)}`);
}

function renderPlayerMeta() {
    $('#player-track').text(playerData.track || '—');
    $('#player-artist').text(playerData.artist || '—');

    const stateEl = document.getElementById('player-state');
    if (playerData.state === 1) {
        stateEl.textContent  = 'playing';
        stateEl.style.opacity = '1';
    } else if (playerData.state === 2) {
        stateEl.textContent  = 'paused';
        stateEl.style.opacity = '0.5';
    } else {
        stateEl.textContent  = 'null';
        stateEl.style.opacity = '1';
    }

    const pane    = document.getElementById('player-pane');
    const divider = document.getElementById('pane-divider');
    const tab     = document.getElementById('tab-player');
    const visible = playerData.state === 1 || playerData.state === 2;
    pane.classList.toggle('visible', visible);
    divider.classList.toggle('visible', visible);
    tab.classList.toggle('visible', visible);

    updateStatusLeft();
}

function renderPlayerTimeline() {
    $('#player-bar').text(buildProgressBar(playerData.position, playerData.duration));
    $('#player-time').text(`${formatTime(playerData.position)} / ${formatTime(playerData.duration)}`);
    updateStatusLeft();
}

window.wallpaperMediaPropertiesListener = function(properties) {
    playerData.track    = properties.title  || null;
    playerData.artist   = properties.artist || null;
    playerData.duration = properties.duration || 0;
    renderPlayerMeta();
};

window.wallpaperMediaPlaybackListener = function(event) {
    playerData.state = event.state;
    renderPlayerMeta();
};

window.wallpaperMediaTimelineListener = function(event) {
    playerData.position = event.position || 0;
    if (event.duration) playerData.duration = event.duration;
    renderPlayerTimeline();
};
