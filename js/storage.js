/**
 * FROGGY HUNT - Save/Load System (localStorage)
 */

const STORAGE_KEY = 'froggy_hunt_save';

const DEFAULT_SAVE = {
    playerName: 'Froschfreund',
    level: 1,
    xp: 0,
    totalFrogsFound: 0,
    totalPlayTime: 0,
    totalStars: 0,
    levelsCompleted: {},    // { levelId: { stars, bestTime, hintsUsed, completed: true } }
    currentLevel: 1,
    settings: {
        music: true,
        sfx: true,
        haptic: true,
        language: 'de',
        reduceMotion: false,
        analytics: false,
    },
    firstLaunch: true,
};

function loadSave() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const data = JSON.parse(raw);
            // Merge with defaults for any missing fields
            return { ...DEFAULT_SAVE, ...data, settings: { ...DEFAULT_SAVE.settings, ...(data.settings || {}) } };
        }
    } catch (e) {
        console.warn('Failed to load save:', e);
    }
    return { ...DEFAULT_SAVE, settings: { ...DEFAULT_SAVE.settings } };
}

function writeSave(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('Failed to save:', e);
    }
}

function resetSave() {
    localStorage.removeItem(STORAGE_KEY);
    return { ...DEFAULT_SAVE, settings: { ...DEFAULT_SAVE.settings } };
}

function getLevelsCompletedCount(save) {
    return Object.keys(save.levelsCompleted).length;
}

function isLevelUnlocked(save, levelId) {
    if (levelId === 1) return true;
    // Unlock next level if previous is completed
    return !!save.levelsCompleted[levelId - 1];
}

function calculateStars(level, time, hintsUsed) {
    let stars = 1; // Always at least 1 star for completing
    if (time <= level.targetTime) stars++;
    if (hintsUsed === 0) stars++;
    return stars;
}

function calculateXP(stars, frogsFound, time, targetTime) {
    let xp = frogsFound * 10;          // 10 XP per frog
    xp += stars * 25;                   // 25 XP per star
    if (time <= targetTime) {
        xp += Math.floor((targetTime - time) * 2);  // Bonus for fast completion
    }
    return xp;
}

function addXP(save, amount) {
    save.xp += amount;
    const required = getXPForLevel(save.level);
    while (save.xp >= required && save.level < 99) {
        save.xp -= required;
        save.level++;
    }
    return save;
}
