/**
 * FROGGY HUNT - Main Application Controller
 * Handles navigation, UI updates, and state management
 */

(function () {
    'use strict';

    // State
    let save = loadSave();
    const game = new FroggyGame();
    let countdownInterval = null;

    // ==========================================
    // INITIALIZATION
    // ==========================================

    function init() {
        // Show splash screen, then transition to menu
        animateSplash(() => {
            showScreen('main-menu');
            updateMenuUI();
            startCountdown();
        });

        bindEvents();
        applySettings();

        // Initialize audio on first interaction
        document.addEventListener('click', () => audio.init(), { once: true });
        document.addEventListener('touchstart', () => audio.init(), { once: true });
    }

    function animateSplash(callback) {
        const bar = document.querySelector('.splash-loader-bar');
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
                progress = 100;
                bar.style.width = '100%';
                clearInterval(interval);
                setTimeout(callback, 400);
            } else {
                bar.style.width = progress + '%';
            }
        }, 150);
    }

    // ==========================================
    // SCREEN NAVIGATION
    // ==========================================

    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    // ==========================================
    // MENU UI
    // ==========================================

    function updateMenuUI() {
        // Player info
        document.getElementById('player-name').textContent = save.playerName;
        document.getElementById('player-level').textContent = save.level;

        const xpNeeded = getXPForLevel(save.level);
        const xpPercent = Math.min(100, (save.xp / xpNeeded) * 100);
        document.getElementById('xp-bar-fill').style.width = xpPercent + '%';
        document.getElementById('xp-text').textContent = `${save.xp} / ${xpNeeded}`;

        // Current level card
        const currentLevelData = LEVELS.find(l => l.id === save.currentLevel) || LEVELS[0];
        document.getElementById('current-level-name').textContent = currentLevelData.name;
        document.getElementById('current-level-frogs').textContent = currentLevelData.frogs.length;
        document.getElementById('level-preview').textContent = currentLevelData.icon;

        const levelResult = save.levelsCompleted[currentLevelData.id];
        if (levelResult) {
            document.getElementById('current-level-best').textContent = formatTime(levelResult.bestTime);
        } else {
            document.getElementById('current-level-best').textContent = '--:--';
        }

        // Audio buttons
        updateAudioButtons();
    }

    function updateAudioButtons() {
        const musicBtn = document.getElementById('btn-music');
        const soundBtn = document.getElementById('btn-sound');
        musicBtn.classList.toggle('muted', !save.settings.music);
        soundBtn.classList.toggle('muted', !save.settings.sfx);
        musicBtn.textContent = save.settings.music ? '🎵' : '🔇';
        soundBtn.textContent = save.settings.sfx ? '🔊' : '🔈';
    }

    // ==========================================
    // LEVEL SELECT
    // ==========================================

    function showLevelSelect() {
        const grid = document.getElementById('level-grid');
        grid.innerHTML = '';

        LEVELS.forEach(level => {
            const tile = document.createElement('div');
            const unlocked = isLevelUnlocked(save, level.id);
            const result = save.levelsCompleted[level.id];

            tile.className = 'level-tile' +
                (!unlocked ? ' locked' : '') +
                (result ? ' completed' : '');

            if (unlocked) {
                tile.innerHTML = `
                    <span class="level-tile-icon">${level.icon}</span>
                    <span class="level-tile-number">${level.name}</span>
                    <span class="level-tile-stars">${result ? '⭐'.repeat(result.stars) + '☆'.repeat(3 - result.stars) : '☆☆☆'}</span>
                `;
                tile.addEventListener('click', () => {
                    audio.playClick();
                    audio.vibrateLight();
                    startGame(level.id);
                });
            } else {
                tile.innerHTML = `
                    <span class="level-tile-lock">🔒</span>
                    <span class="level-tile-number">${level.name}</span>
                `;
            }

            grid.appendChild(tile);
        });

        showScreen('level-select');
    }

    // ==========================================
    // GAME
    // ==========================================

    function startGame(levelId) {
        const level = LEVELS.find(l => l.id === levelId);
        if (!level) return;

        save.currentLevel = levelId;
        writeSave(save);

        showScreen('game-screen');

        game.onFrogFound = (found, total) => {
            // Could update additional UI here
        };

        game.onLevelComplete = (result) => {
            showLevelComplete(result);
        };

        game.startLevel(level);
    }

    function showLevelComplete(result) {
        // Update save
        const existing = save.levelsCompleted[result.levelId];
        const isNewBest = !existing || result.time < existing.bestTime;
        const isMoreStars = !existing || result.stars > existing.stars;

        save.levelsCompleted[result.levelId] = {
            stars: isMoreStars ? result.stars : existing.stars,
            bestTime: isNewBest ? result.time : existing.bestTime,
            hintsUsed: result.hintsUsed,
            completed: true,
        };

        save.totalFrogsFound += result.frogsFound;
        save.totalPlayTime += result.time;
        save.totalStars = Object.values(save.levelsCompleted).reduce((sum, l) => sum + l.stars, 0);

        const prevLevel = save.level;
        addXP(save, result.xp);
        writeSave(save);

        if (save.level > prevLevel) {
            audio.playLevelUp();
        }

        // Update complete screen
        document.getElementById('complete-time').textContent = formatTime(result.time);
        document.getElementById('complete-frogs').textContent = `${result.frogsFound}/${result.totalFrogs}`;
        document.getElementById('complete-hints').textContent = result.hintsUsed;
        document.getElementById('complete-xp').textContent = result.xp;
        document.getElementById('complete-stars').textContent = '⭐'.repeat(result.stars) + '☆'.repeat(3 - result.stars);

        // Check if there's a next level
        const nextLevel = LEVELS.find(l => l.id === result.levelId + 1);
        const nextBtn = document.getElementById('btn-next-level');
        if (nextLevel) {
            nextBtn.style.display = '';
            nextBtn.textContent = `Nächstes Level: ${nextLevel.name} →`;
        } else {
            nextBtn.style.display = 'none';
        }

        showScreen('level-complete');
    }

    // ==========================================
    // HISTORY
    // ==========================================

    function showHistory() {
        document.getElementById('stat-total-frogs').textContent = save.totalFrogsFound;
        document.getElementById('stat-levels-done').textContent = getLevelsCompletedCount(save);
        document.getElementById('stat-total-time').textContent = formatTime(save.totalPlayTime);
        document.getElementById('stat-total-stars').textContent = save.totalStars;

        const list = document.getElementById('history-list');
        const completedIds = Object.keys(save.levelsCompleted).map(Number).sort((a, b) => a - b);

        if (completedIds.length === 0) {
            list.innerHTML = '<p class="empty-state">Noch keine Level abgeschlossen. Spiel los! 🐸</p>';
        } else {
            list.innerHTML = '';
            completedIds.forEach(id => {
                const level = LEVELS.find(l => l.id === id);
                const result = save.levelsCompleted[id];
                if (!level) return;

                const item = document.createElement('div');
                item.className = 'history-item';
                item.innerHTML = `
                    <div class="history-item-info">
                        <h4>${level.icon} ${level.name}</h4>
                        <p>⏱️ ${formatTime(result.bestTime)} | 💡 ${result.hintsUsed} Hinweise</p>
                    </div>
                    <div class="history-item-stars">${'⭐'.repeat(result.stars)}${'☆'.repeat(3 - result.stars)}</div>
                `;
                list.appendChild(item);
            });
        }

        showScreen('history-screen');
    }

    // ==========================================
    // SETTINGS
    // ==========================================

    function showSettings() {
        document.getElementById('setting-music').checked = save.settings.music;
        document.getElementById('setting-sfx').checked = save.settings.sfx;
        document.getElementById('setting-haptic').checked = save.settings.haptic;
        document.getElementById('setting-language').value = save.settings.language;
        document.getElementById('setting-reduce-motion').checked = save.settings.reduceMotion;
        document.getElementById('setting-analytics').checked = save.settings.analytics;
        document.getElementById('setting-name').value = save.playerName;

        showScreen('settings-screen');
    }

    function applySettings() {
        audio.setMusic(save.settings.music);
        audio.setSfx(save.settings.sfx);
        audio.setHaptic(save.settings.haptic);

        if (save.settings.reduceMotion) {
            document.body.style.setProperty('--anim-duration', '0.01ms');
        } else {
            document.body.style.removeProperty('--anim-duration');
        }
    }

    // ==========================================
    // COUNTDOWN (Next level timer)
    // ==========================================

    function startCountdown() {
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 60000);
    }

    function updateCountdown() {
        const now = new Date();
        // Find next Wednesday
        const nextWednesday = new Date(now);
        nextWednesday.setDate(now.getDate() + ((3 - now.getDay() + 7) % 7 || 7));
        nextWednesday.setHours(0, 0, 0, 0);

        if (now.getDay() === 3 && now.getHours() < 24) {
            // It's Wednesday, show today or next week
            if (now.getHours() >= 12) {
                nextWednesday.setDate(nextWednesday.getDate() + 7);
            }
        }

        const diff = nextWednesday - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        document.getElementById('countdown-timer').textContent =
            `${days.toString().padStart(2, '0')}T ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
    }

    // ==========================================
    // EVENT BINDINGS
    // ==========================================

    function bindEvents() {
        // Main menu buttons
        document.getElementById('btn-play').addEventListener('click', () => {
            audio.playClick();
            showLevelSelect();
        });

        document.getElementById('btn-continue').addEventListener('click', () => {
            audio.playClick();
            startGame(save.currentLevel);
        });

        document.getElementById('btn-history').addEventListener('click', () => {
            audio.playClick();
            showHistory();
        });

        document.getElementById('btn-settings').addEventListener('click', () => {
            audio.playClick();
            showSettings();
        });

        document.getElementById('btn-settings-top').addEventListener('click', () => {
            audio.playClick();
            showSettings();
        });

        document.getElementById('btn-info').addEventListener('click', () => {
            audio.playClick();
            showScreen('info-screen');
        });

        // Top bar audio toggles
        document.getElementById('btn-music').addEventListener('click', () => {
            save.settings.music = !save.settings.music;
            audio.setMusic(save.settings.music);
            updateAudioButtons();
            writeSave(save);
        });

        document.getElementById('btn-sound').addEventListener('click', () => {
            save.settings.sfx = !save.settings.sfx;
            audio.setSfx(save.settings.sfx);
            updateAudioButtons();
            writeSave(save);
            audio.playClick();
        });

        // Back buttons
        document.getElementById('btn-back-levels').addEventListener('click', () => {
            audio.playClick();
            showScreen('main-menu');
            updateMenuUI();
        });

        document.getElementById('btn-back-game').addEventListener('click', () => {
            audio.playClick();
            game.destroy();
            showScreen('main-menu');
            updateMenuUI();
        });

        document.getElementById('btn-back-history').addEventListener('click', () => {
            audio.playClick();
            showScreen('main-menu');
            updateMenuUI();
        });

        document.getElementById('btn-back-settings').addEventListener('click', () => {
            audio.playClick();
            showScreen('main-menu');
            updateMenuUI();
        });

        document.getElementById('btn-back-info').addEventListener('click', () => {
            audio.playClick();
            showScreen('main-menu');
            updateMenuUI();
        });

        // Game buttons
        document.getElementById('btn-hint').addEventListener('click', () => {
            audio.playClick();
            game.useHint();
        });

        // Level complete buttons
        document.getElementById('btn-next-level').addEventListener('click', () => {
            audio.playClick();
            const nextId = (save.currentLevel || 1) + 1;
            if (LEVELS.find(l => l.id === nextId)) {
                startGame(nextId);
            }
        });

        document.getElementById('btn-replay').addEventListener('click', () => {
            audio.playClick();
            startGame(save.currentLevel);
        });

        document.getElementById('btn-back-menu').addEventListener('click', () => {
            audio.playClick();
            game.destroy();
            showScreen('main-menu');
            updateMenuUI();
        });

        // Settings changes
        document.getElementById('setting-music').addEventListener('change', (e) => {
            save.settings.music = e.target.checked;
            audio.setMusic(save.settings.music);
            writeSave(save);
        });

        document.getElementById('setting-sfx').addEventListener('change', (e) => {
            save.settings.sfx = e.target.checked;
            audio.setSfx(save.settings.sfx);
            writeSave(save);
        });

        document.getElementById('setting-haptic').addEventListener('change', (e) => {
            save.settings.haptic = e.target.checked;
            audio.setHaptic(save.settings.haptic);
            writeSave(save);
        });

        document.getElementById('setting-language').addEventListener('change', (e) => {
            save.settings.language = e.target.value;
            writeSave(save);
        });

        document.getElementById('setting-reduce-motion').addEventListener('change', (e) => {
            save.settings.reduceMotion = e.target.checked;
            applySettings();
            writeSave(save);
        });

        document.getElementById('setting-analytics').addEventListener('change', (e) => {
            save.settings.analytics = e.target.checked;
            writeSave(save);
        });

        document.getElementById('setting-name').addEventListener('change', (e) => {
            const name = e.target.value.trim();
            if (name.length > 0) {
                save.playerName = name;
                writeSave(save);
            }
        });

        document.getElementById('btn-reset-progress').addEventListener('click', () => {
            if (confirm('Bist du sicher? Dein gesamter Fortschritt wird gelöscht!')) {
                save = resetSave();
                updateMenuUI();
                showSettings();
                audio.playClick();
            }
        });

        // Current level card
        document.getElementById('current-level-card').addEventListener('click', (e) => {
            if (e.target.id !== 'btn-continue') {
                // Don't double-trigger from the button
            }
        });

        // Handle app visibility (pause game)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && game.isRunning) {
                game.pause();
            } else if (!document.hidden && game.currentLevel && !game.isRunning) {
                game.resume();
            }
        });
    }

    // ==========================================
    // UTILITIES
    // ==========================================

    function formatTime(seconds) {
        if (!seconds && seconds !== 0) return '--:--';
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    // ==========================================
    // START
    // ==========================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
