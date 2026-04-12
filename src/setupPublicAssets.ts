/** Muss vor global.css geladen werden: CSS nutzt var(--fh-bg-*) für GitHub-Pages-Base. */
const b = import.meta.env.BASE_URL
document.documentElement.style.setProperty('--fh-bg-phone', `url('${b}assets/game_ui_phone.png')`)
document.documentElement.style.setProperty('--fh-bg-desktop', `url('${b}assets/game-scene-bg.png')`)
document.documentElement.style.setProperty('--fh-play-blank-bg', `url('${b}assets/game_ui.png')`)
