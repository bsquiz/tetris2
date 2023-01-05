import display from './display.js';
import tetris from './game.js';

const urlParams = new URLSearchParams(window.location.search);
const isDebug = (urlParams.get('debug') === 'true');

document.querySelector('#startBtn').addEventListener('click', () => tetris.start());;
document.querySelector('#restartBtn').addEventListener('click', () => tetris.start());;
document.addEventListener('keydown', e => tetris.keysDown[e.code] = true);
document.addEventListener('keyup', e => {
    tetris.keysDown[e.code] = false;
    tetris.keysReleased[e.code] = true;
});

tetris.init(isDebug, display);
