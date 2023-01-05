import {
    pieceCanMove, rotatePiece, copyPieceToGameboard, getNewPiece, checkClearedRows
} from './utils.js';
import { Tetromino, Tetrominos, GameDimension, Key } from './constants.js';

const tetris = {
    currentPiece: {},
    nextPiece: {},
    dropPreviewPiece: {},
    score: 0,
    clearedLines: 0,
    speed: 1,
    display: {},
    keysDown: {},
    keysReleased: {},
    keyUpDebounce: 8,
    keyDownDebounce: 10,
    currentGameOverTile: 0,
    gameboard: [],
    delay: 0,
    isDebug: false,
    highScore: 0,
    state: 0,
    GameState: {
        MENU: 0,
        PLAYING: 1,
        ANIMATING_GAMEOVER: 2,
        GAMEOVER: 3
    },
    MAX_DELAY: 75,
    MAX_KEY_UP_DEBOUNCE: 8,
    MAX_KEY_DOWN_DEBOUNCE: 10,

    reset() {
        const keys: string[] = Object.keys(this.keysReleased);

        this.score = 0;
        this.highScore = Number(window.sessionStorage.getItem('benjaminbowman_tetris_highscore'));
        this.clearedLines = 0;
        this.currentGameOverTile = GameDimension.WIDTH * GameDimension.HEIGHT - 1;
        this.speed = 1;
        this.delay = 0;
        this.gameboard = [];
        this.currentPiece = getNewPiece();
        this.nextPiece = getNewPiece();
        this.dropPreviewPiece = getNewPiece();

        keys.forEach(key => this.keysReleased[key] = false);

        for (let i=0; i<GameDimension.WIDTH * GameDimension.HEIGHT; i++) {
            this.gameboard[i] = Tetromino.EMPTY;
        }

        this.updateDropPreview();

        this.display.init(this.isDebug);
        this.display.drawGameboard(this.gameboard, this.nextPiece);
        this.display.drawScore(this.score);
        this.display.drawHighScore(this.highScore);
        this.display.drawLines(this.clearedLines);
    },
    init(isDebug: boolean, display) {
        this.isDebug = isDebug;
        this.display = display;

        this.reset();
        window.requestAnimationFrame(() => this.update());
    },
    start() {
        this.reset();
        this.display.hideGameOver();
        this.display.hideMenu();
        this.state = this.GameState.PLAYING;
        this.display.drawPiece(this.currentPiece, this.dropPreviewPiece);
    },
    animateGameOver() {
        this.state = this.GameState.ANIMATING_GAMEOVER;
    },
    gameOver() {
        this.state = this.GameState.GAMEOVER;
        this.display.showGameOver();
        if (this.score > this.highScore) {
            window.sessionStorage.setItem('benjaminbowman_tetris_highscore', this.score.toString());
            this.display.drawHighScore(this.highScore);
        }
    },
    rotatePiece(rotation) {
        // rotate
        const { x, y, type } = this.currentPiece;
        const tiles = Tetrominos[type];
        const transform: number[] = rotatePiece(tiles, rotation);

        if (pieceCanMove(x, y, transform, this.gameboard, 0, 0)) {
            this.currentPiece.rotation = rotation;
            this.currentPiece.tiles = transform;
        }
    },
    movePiece(dx: number, dy: number): boolean {
        let { x, y, tiles } = this.currentPiece;
        let pieceMoved = false;

        if (pieceCanMove(x, y, tiles, this.gameboard, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;

            pieceMoved = true;
        }

        return pieceMoved;
    },
    updateDropPreview() {
        // drop preview
        this.dropPreviewPiece.x = this.currentPiece.x;
        this.dropPreviewPiece.y = this.currentPiece.y;
        this.dropPreviewPiece.tiles = this.currentPiece.tiles;
        let dropY = this.currentPiece.y;

        while(pieceCanMove(
                this.dropPreviewPiece.x, dropY, this.dropPreviewPiece.tiles,
                this.gameboard, 0, 1)
            ) {
            dropY++;
            this.dropPreviewPiece.y = dropY;
        }
    },
    keyWasReleased() {
        return this.keysReleased[Key.RIGHT] || this.keysReleased[Key.LEFT] || this.keysReleased[Key.DOWN];
    },
    clearRows(clearedRows: number[], gameboard: number[]) {
        const copy = [...gameboard];

        // clear rows from top down, copying rows above to cleared row
        for (let i=0; i<clearedRows.length; i++) {
            const row = clearedRows[i];

            for (let j=row+GameDimension.WIDTH; j>GameDimension.WIDTH * 2; j--) {
                const tile = copy[j];

                if (tile === Tetromino.BLOCKED) {
                    // keep walls in place
                    continue;
                }

                // copy tile one row above to current tile
                copy[j] = copy[j - GameDimension.WIDTH];
            }
        }

        return copy;
    },
    update() {
        let redrawGameboard: boolean = false;
        let redrawPiece: boolean = false;

        switch (this.state) {
            case this.GameState.MENU: break;
            case this.GameState.PLAYING:
                const keys: string[] = Object.keys(this.keysReleased);
                let clearedRows: number[] = [];
                let dx: number = 0;
                let dy: number = 0;
                let rotation: number = this.currentPiece.rotation;
                let hardDrop: boolean = false;
                let bottomReached: boolean = false;

                if (this.keysReleased[Key.UP]) rotation === 3 ? rotation = 0 : rotation += 1; // rotate
                if (this.keysReleased[Key.SPACE]) hardDrop = true;

                this.delay += Math.round(this.speed);

                if (this.delay >= this.MAX_DELAY) {
                    this.delay = 0;
                    dy = 1;
                }

                if (hardDrop) {
                    dy = 1;
                    bottomReached = true;

                    while(
                        pieceCanMove(
                            this.currentPiece.x, this.currentPiece.y, this.currentPiece.tiles,
                            this.gameboard, 0, dy)
                        ) {
                        this.currentPiece.y += dy;
                    }
                }

                if (this.keyWasReleased()) {
                    if (this.keysReleased[Key.RIGHT]) {
                        dx = 1;
                    }
                    if (this.keysReleased[Key.LEFT]) {
                        dx = -1;
                    }
                    if (this.keysReleased[Key.DOWN]) {
                        dy = 1; // speed drop
                    }

                    this.keyDownDebounce = this.MAX_KEY_DOWN_DEBOUNCE;
                } else if (this.keyDownDebounce === 0) {
                    if (this.keysDown[Key.RIGHT]) dx = 1;
                    if (this.keysDown[Key.LEFT]) dx = -1;
                    if (this.keysDown[Key.DOWN]) dy = 1; // speed drop
                }

                if (dx !== 0) {
                    // move left and right
                    this.movePiece(dx, 0);
                }

                redrawPiece = dx !==0 || dy !== 0 || rotation !== this.currentPiece.rotation;

                if (rotation !== this.currentPiece.rotation) {
                    this.rotatePiece(rotation);
                }

                // move down
                if (!this.movePiece(0, dy)) {
                    if (this.currentPiece.y < 2) {
                        this.animateGameOver();
                    } else {
                        bottomReached = true;
                    }
                }

                if (bottomReached) {
                    // bottom blocked, reset with new piece at top
                    this.gameboard = copyPieceToGameboard(this.currentPiece, this.gameboard);
                    this.currentPiece = this.nextPiece;
                    this.nextPiece = getNewPiece();
                    redrawGameboard = true;
                }
                if (this.keysDown[Key.RIGHT] || this.keysDown[Key.LEFT] || this.keysDown[Key.DOWN]) {
                    if (this.keyDownDebounce > 0) {
                        this.keyDownDebounce--;
                    } else {
                        this.keyDownDebounce = this.MAX_KEY_DOWN_DEBOUNCE;
                    }
                }

                clearedRows = checkClearedRows(this.gameboard);

                if (clearedRows.length) {
                    this.score += clearedRows.length * 100 * (clearedRows.length * 1.5);
                    this.clearedLines += clearedRows.length;
                    this.speed += this.clearedLines / 500;
                    this.gameboard = this.clearRows(clearedRows, this.gameboard);

                    redrawGameboard = true;

                    this.display.drawLines(this.clearedLines);
                    this.display.drawScore(this.score);
                }

                this.updateDropPreview();

                keys.forEach(key => this.keysReleased[key] = false);

                break;

            case this.GameState.ANIMATING_GAMEOVER:
                if (this.currentGameOverTile < 0) {
                    this.gameOver();
                } else {
                    this.gameboard[this.currentGameOverTile] = Math.floor(Tetrominos.length * Math.random());
                    this.currentGameOverTile--;
                    this.gameboard[this.currentGameOverTile] = Math.floor(Tetrominos.length * Math.random());
                    this.currentGameOverTile--;
                }
                redrawGameboard = true;

                break;

            case this.GameState.GAMEOVER: break;
            default: break;
        }

        if (redrawGameboard) {
            this.display.drawGameboard(this.gameboard, this.nextPiece);
        }

        if (redrawPiece) {
            this.display.drawPiece(this.currentPiece, this.dropPreviewPiece);
        }

        window.requestAnimationFrame(() => this.update());
    }
}

export default tetris;
