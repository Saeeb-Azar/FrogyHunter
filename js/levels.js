/**
 * FROGGY HUNT - Level Definitions
 * Each level defines a scene with hidden frogs
 */

const LEVELS = [
    {
        id: 1,
        name: "Waldlichtung",
        icon: "🌳",
        description: "Ein sonniger Tag auf der Waldlichtung",
        targetTime: 60,
        background: {
            gradient: "linear-gradient(180deg, #87ceeb 0%, #a8d8a8 25%, #5a9a3a 50%, #3a7a2a 75%, #2a5a1a 100%)"
        },
        decorations: [
            { emoji: "🌳", x: 5, y: 25, size: 50 },
            { emoji: "🌳", x: 85, y: 20, size: 55 },
            { emoji: "🌲", x: 15, y: 22, size: 45 },
            { emoji: "🌲", x: 75, y: 18, size: 48 },
            { emoji: "🌿", x: 10, y: 70, size: 30 },
            { emoji: "🌿", x: 50, y: 75, size: 28 },
            { emoji: "🌿", x: 80, y: 68, size: 32 },
            { emoji: "🍄", x: 25, y: 72, size: 22 },
            { emoji: "🍄", x: 65, y: 78, size: 20 },
            { emoji: "🌸", x: 30, y: 30, size: 18 },
            { emoji: "🌺", x: 60, y: 28, size: 20 },
            { emoji: "🦋", x: 45, y: 15, size: 22 },
            { emoji: "🌻", x: 40, y: 65, size: 24 },
            { emoji: "☀️", x: 80, y: 5, size: 35 },
            { emoji: "☁️", x: 20, y: 5, size: 30 },
            { emoji: "☁️", x: 55, y: 8, size: 25 },
            { emoji: "🪵", x: 35, y: 80, size: 35 },
            { emoji: "🪨", x: 70, y: 82, size: 28 },
            { emoji: "🌱", x: 55, y: 85, size: 18 },
            { emoji: "🌱", x: 20, y: 82, size: 16 },
        ],
        frogs: [
            { x: 12, y: 68, difficulty: "easy", hint: "Schau bei den Farnblättern links!" },
            { x: 48, y: 73, difficulty: "easy", hint: "In der Mitte des Waldes, bei den Pflanzen." },
            { x: 78, y: 65, difficulty: "medium", hint: "Rechts neben dem großen Stein." },
            { x: 33, y: 78, difficulty: "medium", hint: "Beim umgefallenen Baumstamm." },
            { x: 62, y: 80, difficulty: "hard", hint: "Zwischen den Pilzen versteckt." },
        ]
    },
    {
        id: 2,
        name: "Seerosenteich",
        icon: "🪷",
        description: "Ein friedlicher Teich voller Seerosen",
        targetTime: 75,
        background: {
            gradient: "linear-gradient(180deg, #87ceeb 0%, #6ab4d6 20%, #4a8ab0 40%, #3a7a6a 60%, #2a6a4a 100%)"
        },
        decorations: [
            { emoji: "🪷", x: 20, y: 50, size: 35 },
            { emoji: "🪷", x: 55, y: 45, size: 30 },
            { emoji: "🪷", x: 75, y: 55, size: 32 },
            { emoji: "🪷", x: 35, y: 60, size: 28 },
            { emoji: "🌊", x: 45, y: 70, size: 22 },
            { emoji: "🌊", x: 65, y: 68, size: 20 },
            { emoji: "🌾", x: 5, y: 35, size: 40 },
            { emoji: "🌾", x: 90, y: 40, size: 38 },
            { emoji: "🌾", x: 8, y: 55, size: 35 },
            { emoji: "🪻", x: 92, y: 58, size: 25 },
            { emoji: "🦆", x: 40, y: 40, size: 28 },
            { emoji: "🐟", x: 30, y: 75, size: 18 },
            { emoji: "🦋", x: 60, y: 20, size: 22 },
            { emoji: "🌤️", x: 75, y: 5, size: 30 },
            { emoji: "☁️", x: 25, y: 8, size: 28 },
            { emoji: "🪨", x: 15, y: 72, size: 30 },
            { emoji: "🪨", x: 82, y: 78, size: 25 },
            { emoji: "🐌", x: 88, y: 75, size: 16 },
        ],
        frogs: [
            { x: 18, y: 48, difficulty: "easy", hint: "Bei der großen Seerose links." },
            { x: 53, y: 43, difficulty: "easy", hint: "Auf einer Seerose in der Mitte." },
            { x: 73, y: 53, difficulty: "medium", hint: "Bei den Seerosen rechts." },
            { x: 7, y: 52, difficulty: "medium", hint: "Versteckt im Schilf links." },
            { x: 33, y: 58, difficulty: "hard", hint: "Zwischen den Seerosen, kaum sichtbar." },
            { x: 85, y: 73, difficulty: "hard", hint: "Beim Stein am rechten Ufer." },
        ]
    },
    {
        id: 3,
        name: "Regenwald",
        icon: "🌴",
        description: "Tief im tropischen Regenwald",
        targetTime: 90,
        background: {
            gradient: "linear-gradient(180deg, #4a6a3a 0%, #3a5a2a 25%, #2a4a1a 50%, #1a3a0a 75%, #0a2a0a 100%)"
        },
        decorations: [
            { emoji: "🌴", x: 5, y: 10, size: 60 },
            { emoji: "🌴", x: 88, y: 8, size: 55 },
            { emoji: "🌴", x: 45, y: 5, size: 50 },
            { emoji: "🌿", x: 15, y: 40, size: 35 },
            { emoji: "🌿", x: 70, y: 35, size: 38 },
            { emoji: "🌿", x: 40, y: 50, size: 30 },
            { emoji: "🌺", x: 25, y: 30, size: 22 },
            { emoji: "🌺", x: 60, y: 25, size: 20 },
            { emoji: "🌺", x: 80, y: 45, size: 18 },
            { emoji: "🦜", x: 20, y: 15, size: 25 },
            { emoji: "🐒", x: 72, y: 12, size: 28 },
            { emoji: "🦎", x: 50, y: 65, size: 20 },
            { emoji: "🍃", x: 35, y: 55, size: 16 },
            { emoji: "🍃", x: 65, y: 60, size: 18 },
            { emoji: "💧", x: 30, y: 70, size: 14 },
            { emoji: "💧", x: 55, y: 72, size: 12 },
            { emoji: "🪵", x: 45, y: 80, size: 40 },
            { emoji: "🍄", x: 20, y: 75, size: 22 },
            { emoji: "🍄", x: 75, y: 70, size: 20 },
            { emoji: "🕸️", x: 85, y: 30, size: 25 },
        ],
        frogs: [
            { x: 13, y: 38, difficulty: "easy", hint: "Neben den Farnblättern links." },
            { x: 68, y: 33, difficulty: "easy", hint: "Bei den Blättern rechts." },
            { x: 38, y: 48, difficulty: "medium", hint: "In der dichten Vegetation in der Mitte." },
            { x: 78, y: 43, difficulty: "medium", hint: "Neben den Blumen rechts." },
            { x: 48, y: 78, difficulty: "hard", hint: "Am umgefallenen Baumstamm." },
            { x: 18, y: 73, difficulty: "hard", hint: "Zwischen den Pilzen links unten." },
            { x: 83, y: 68, difficulty: "hard", hint: "Gut versteckt bei den Pilzen rechts." },
        ]
    },
    {
        id: 4,
        name: "Bergbach",
        icon: "⛰️",
        description: "Am plätschernden Bergbach",
        targetTime: 80,
        background: {
            gradient: "linear-gradient(180deg, #6aa0d0 0%, #8ab8d8 20%, #7aaa7a 40%, #5a8a5a 60%, #4a7a4a 80%, #3a6a3a 100%)"
        },
        decorations: [
            { emoji: "⛰️", x: 10, y: 5, size: 55 },
            { emoji: "⛰️", x: 80, y: 3, size: 50 },
            { emoji: "🏔️", x: 45, y: 0, size: 60 },
            { emoji: "🌊", x: 30, y: 55, size: 25 },
            { emoji: "🌊", x: 50, y: 52, size: 28 },
            { emoji: "🌊", x: 70, y: 58, size: 22 },
            { emoji: "🪨", x: 20, y: 50, size: 30 },
            { emoji: "🪨", x: 60, y: 48, size: 35 },
            { emoji: "🪨", x: 40, y: 60, size: 25 },
            { emoji: "🌲", x: 5, y: 25, size: 45 },
            { emoji: "🌲", x: 90, y: 22, size: 42 },
            { emoji: "🌲", x: 15, y: 30, size: 38 },
            { emoji: "🌿", x: 25, y: 68, size: 28 },
            { emoji: "🌿", x: 75, y: 65, size: 30 },
            { emoji: "🐟", x: 45, y: 58, size: 16 },
            { emoji: "🦅", x: 55, y: 10, size: 25 },
            { emoji: "☁️", x: 30, y: 5, size: 25 },
        ],
        frogs: [
            { x: 22, y: 48, difficulty: "easy", hint: "Am Stein links neben dem Bach." },
            { x: 58, y: 46, difficulty: "easy", hint: "Am großen Stein rechts." },
            { x: 38, y: 58, difficulty: "medium", hint: "Am Bach in der Mitte." },
            { x: 73, y: 63, difficulty: "medium", hint: "Bei den Farnblättern rechts." },
            { x: 13, y: 65, difficulty: "hard", hint: "Versteckt am linken Ufer." },
            { x: 48, y: 72, difficulty: "hard", hint: "Unterhalb der Steine, kaum sichtbar." },
        ]
    },
    {
        id: 5,
        name: "Nachtsumpf",
        icon: "🌙",
        description: "Im geheimnisvollen Sumpf bei Nacht",
        targetTime: 100,
        background: {
            gradient: "linear-gradient(180deg, #0a0a2a 0%, #1a1a4a 20%, #0a2a2a 40%, #0a3a1a 60%, #0a2a0a 80%, #0a1a0a 100%)"
        },
        decorations: [
            { emoji: "🌙", x: 80, y: 3, size: 35 },
            { emoji: "⭐", x: 20, y: 5, size: 14 },
            { emoji: "⭐", x: 40, y: 8, size: 12 },
            { emoji: "⭐", x: 60, y: 3, size: 10 },
            { emoji: "⭐", x: 35, y: 12, size: 11 },
            { emoji: "✨", x: 50, y: 6, size: 13 },
            { emoji: "🌿", x: 10, y: 40, size: 35 },
            { emoji: "🌿", x: 85, y: 35, size: 38 },
            { emoji: "🌿", x: 45, y: 55, size: 30 },
            { emoji: "🪷", x: 30, y: 65, size: 25 },
            { emoji: "🪷", x: 60, y: 60, size: 28 },
            { emoji: "🪵", x: 20, y: 70, size: 38 },
            { emoji: "🦉", x: 12, y: 25, size: 22 },
            { emoji: "🦇", x: 70, y: 15, size: 20 },
            { emoji: "🕯️", x: 50, y: 35, size: 18 },
            { emoji: "💀", x: 75, y: 75, size: 16 },
            { emoji: "🍄", x: 35, y: 78, size: 22 },
            { emoji: "🍄", x: 80, y: 68, size: 20 },
            { emoji: "🐛", x: 55, y: 45, size: 14 },
            { emoji: "🌫️", x: 40, y: 30, size: 40 },
        ],
        frogs: [
            { x: 8, y: 38, difficulty: "easy", hint: "Bei den Blättern links." },
            { x: 83, y: 33, difficulty: "easy", hint: "Im Schilf rechts." },
            { x: 28, y: 63, difficulty: "medium", hint: "Bei der Seerose links." },
            { x: 58, y: 58, difficulty: "medium", hint: "Bei der Seerose rechts." },
            { x: 43, y: 53, difficulty: "hard", hint: "In der Mitte des Sumpfes." },
            { x: 18, y: 68, difficulty: "hard", hint: "Beim alten Baumstamm." },
            { x: 73, y: 73, difficulty: "hard", hint: "Neben dem Totenschädel... gruselig!" },
            { x: 33, y: 76, difficulty: "hard", hint: "Bei den leuchtenden Pilzen." },
        ]
    },
    {
        id: 6,
        name: "Blumenwiese",
        icon: "🌻",
        description: "Eine bunte Wiese voller Blumen",
        targetTime: 70,
        background: {
            gradient: "linear-gradient(180deg, #87ceeb 0%, #a8d8ea 20%, #98d898 40%, #78c878 60%, #58b858 80%, #48a848 100%)"
        },
        decorations: [
            { emoji: "🌻", x: 10, y: 40, size: 35 },
            { emoji: "🌻", x: 80, y: 35, size: 38 },
            { emoji: "🌻", x: 50, y: 42, size: 32 },
            { emoji: "🌷", x: 25, y: 55, size: 25 },
            { emoji: "🌷", x: 65, y: 50, size: 28 },
            { emoji: "🌹", x: 40, y: 58, size: 22 },
            { emoji: "🌹", x: 75, y: 60, size: 24 },
            { emoji: "🌼", x: 15, y: 65, size: 20 },
            { emoji: "🌼", x: 55, y: 68, size: 22 },
            { emoji: "🌼", x: 85, y: 55, size: 18 },
            { emoji: "🦋", x: 30, y: 25, size: 24 },
            { emoji: "🦋", x: 60, y: 20, size: 20 },
            { emoji: "🐝", x: 45, y: 30, size: 18 },
            { emoji: "🐝", x: 70, y: 28, size: 16 },
            { emoji: "🐞", x: 35, y: 72, size: 14 },
            { emoji: "☀️", x: 85, y: 5, size: 35 },
            { emoji: "☁️", x: 15, y: 8, size: 28 },
            { emoji: "☁️", x: 50, y: 5, size: 22 },
            { emoji: "🌱", x: 20, y: 80, size: 16 },
            { emoji: "🌱", x: 70, y: 78, size: 18 },
        ],
        frogs: [
            { x: 12, y: 63, difficulty: "easy", hint: "Bei den Gänseblümchen links." },
            { x: 53, y: 66, difficulty: "easy", hint: "Zwischen den Blumen in der Mitte." },
            { x: 83, y: 53, difficulty: "medium", hint: "Neben den Blumen rechts." },
            { x: 38, y: 56, difficulty: "medium", hint: "Bei den Rosen versteckt." },
            { x: 73, y: 58, difficulty: "hard", hint: "Zwischen den Rosen rechts." },
        ]
    },
];

// XP required per level
const XP_TABLE = [
    0,      // Level 0 (unused)
    100,    // Level 1 → 2
    200,    // Level 2 → 3
    350,    // Level 3 → 4
    500,    // Level 4 → 5
    700,    // Level 5 → 6
    1000,   // Level 6 → 7
    1400,   // Level 7 → 8
    1800,   // Level 8 → 9
    2500,   // Level 9 → 10
    3500,   // Level 10+
];

function getXPForLevel(level) {
    if (level <= 0) return 0;
    if (level >= XP_TABLE.length) return XP_TABLE[XP_TABLE.length - 1];
    return XP_TABLE[level];
}
