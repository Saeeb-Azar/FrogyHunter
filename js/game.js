/**
 * FROGGY HUNT - Game Engine
 * Handles the actual gameplay: rendering scenes, finding frogs, scoring
 */

class FroggyGame {
    constructor() {
        this.currentLevel = null;
        this.frogsFound = [];
        this.hintsUsed = 0;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.isRunning = false;
        this.onFrogFound = null;
        this.onLevelComplete = null;
    }

    startLevel(level) {
        this.currentLevel = level;
        this.frogsFound = [];
        this.hintsUsed = 0;
        this.startTime = Date.now();
        this.elapsedTime = 0;
        this.isRunning = true;

        this.renderScene();
        this.startTimer();
    }

    renderScene() {
        const scene = document.getElementById('game-scene');
        scene.innerHTML = '';
        scene.style.background = this.currentLevel.background.gradient;

        // Render decorations
        this.currentLevel.decorations.forEach((deco, i) => {
            const el = document.createElement('div');
            el.className = 'scene-decoration';
            el.textContent = deco.emoji;
            el.style.left = deco.x + '%';
            el.style.top = deco.y + '%';
            el.style.fontSize = deco.size + 'px';
            el.style.transform = `translate(-50%, -50%)`;
            scene.appendChild(el);
        });

        // Render frogs (hidden)
        this.currentLevel.frogs.forEach((frog, i) => {
            const el = document.createElement('div');
            el.className = `scene-frog hidden-${frog.difficulty}`;
            el.dataset.index = i;

            const emoji = document.createElement('span');
            emoji.className = 'frog-emoji';
            emoji.textContent = '🐸';
            el.appendChild(emoji);

            el.style.left = frog.x + '%';
            el.style.top = frog.y + '%';
            el.style.transform = 'translate(-50%, -50%)';

            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleFrogTap(i, el);
            });

            el.addEventListener('touchstart', (e) => {
                e.stopPropagation();
            }, { passive: true });

            scene.appendChild(el);
        });

        // Handle wrong taps on the scene
        scene.addEventListener('click', (e) => {
            if (e.target === scene || e.target.classList.contains('scene-decoration')) {
                this.handleWrongTap(e);
            }
        });

        // Update UI
        document.getElementById('game-level-name').textContent = this.currentLevel.name;
        document.getElementById('frogs-total').textContent = this.currentLevel.frogs.length;
        document.getElementById('frogs-found').textContent = '0';
        document.getElementById('hint-text').textContent = 'Tippe auf versteckte Frösche!';
    }

    handleFrogTap(index, element) {
        if (!this.isRunning) return;
        if (this.frogsFound.includes(index)) return;

        this.frogsFound.push(index);
        element.classList.remove('hidden-easy', 'hidden-medium', 'hidden-hard');
        element.classList.add('found');

        // Show found feedback
        this.showTapFeedback(element, true);
        this.showFoundIndicator(element);

        // Audio & haptic
        audio.playFrogFound();
        audio.vibrateSuccess();

        // Update counter
        document.getElementById('frogs-found').textContent = this.frogsFound.length;

        if (this.onFrogFound) {
            this.onFrogFound(this.frogsFound.length, this.currentLevel.frogs.length);
        }

        // Check if level complete
        if (this.frogsFound.length === this.currentLevel.frogs.length) {
            this.completeLevel();
        }
    }

    handleWrongTap(event) {
        if (!this.isRunning) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Show wrong feedback
        const feedback = document.createElement('div');
        feedback.className = 'tap-feedback';
        feedback.style.left = x + 'px';
        feedback.style.top = y + 'px';
        event.currentTarget.appendChild(feedback);
        setTimeout(() => feedback.remove(), 500);

        audio.playWrongTap();
        audio.vibrateLight();
    }

    showTapFeedback(element, correct) {
        const scene = document.getElementById('game-scene');
        const rect = element.getBoundingClientRect();
        const sceneRect = scene.getBoundingClientRect();

        const feedback = document.createElement('div');
        feedback.className = 'tap-feedback' + (correct ? ' correct' : '');
        feedback.style.left = (rect.left - sceneRect.left + rect.width / 2) + 'px';
        feedback.style.top = (rect.top - sceneRect.top + rect.height / 2) + 'px';
        scene.appendChild(feedback);
        setTimeout(() => feedback.remove(), 500);
    }

    showFoundIndicator(element) {
        const scene = document.getElementById('game-scene');
        const rect = element.getBoundingClientRect();
        const sceneRect = scene.getBoundingClientRect();

        const indicator = document.createElement('div');
        indicator.className = 'found-indicator';
        indicator.textContent = '✓';
        indicator.style.left = (rect.left - sceneRect.left + rect.width / 2) + 'px';
        indicator.style.top = (rect.top - sceneRect.top) + 'px';
        scene.appendChild(indicator);
        setTimeout(() => indicator.remove(), 1000);
    }

    useHint() {
        if (!this.isRunning) return;

        // Find first unfound frog
        const unfoundIndex = this.currentLevel.frogs.findIndex((_, i) => !this.frogsFound.includes(i));
        if (unfoundIndex === -1) return;

        this.hintsUsed++;
        const frog = this.currentLevel.frogs[unfoundIndex];

        // Show hint text
        document.getElementById('hint-text').textContent = '💡 ' + frog.hint;

        // Show visual hint on scene
        const scene = document.getElementById('game-scene');
        const highlight = document.createElement('div');
        highlight.className = 'hint-highlight';
        highlight.style.left = frog.x + '%';
        highlight.style.top = frog.y + '%';
        scene.appendChild(highlight);
        setTimeout(() => highlight.remove(), 3000);

        audio.playHint();
        audio.vibrateMedium();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.isRunning) return;
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(this.elapsedTime / 60).toString().padStart(2, '0');
            const seconds = (this.elapsedTime % 60).toString().padStart(2, '0');
            document.getElementById('game-timer').textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    completeLevel() {
        this.isRunning = false;
        this.stopTimer();

        const stars = calculateStars(this.currentLevel, this.elapsedTime, this.hintsUsed);
        const xp = calculateXP(stars, this.frogsFound.length, this.elapsedTime, this.currentLevel.targetTime);

        audio.playLevelComplete();
        audio.vibrateSuccess();

        // Delay to let the last frog animation play
        setTimeout(() => {
            if (this.onLevelComplete) {
                this.onLevelComplete({
                    levelId: this.currentLevel.id,
                    time: this.elapsedTime,
                    frogsFound: this.frogsFound.length,
                    totalFrogs: this.currentLevel.frogs.length,
                    hintsUsed: this.hintsUsed,
                    stars: stars,
                    xp: xp,
                });
            }
        }, 800);
    }

    pause() {
        this.isRunning = false;
        this.stopTimer();
    }

    resume() {
        if (this.currentLevel && this.frogsFound.length < this.currentLevel.frogs.length) {
            this.isRunning = true;
            // Adjust start time to preserve elapsed time
            this.startTime = Date.now() - (this.elapsedTime * 1000);
            this.startTimer();
        }
    }

    destroy() {
        this.isRunning = false;
        this.stopTimer();
        this.currentLevel = null;
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }
}
