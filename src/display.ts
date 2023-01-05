import { isPiece, getPieceIndex, getPieceTile } from './utils.js';
import { GameDimension, Tetromino, Color } from './constants.js';

const display = {
    $canvas: document.getElementById('canvas'),
    $pieceCanvas: document.getElementById('pieceCanvas'),
    $previewCanvas: document.getElementById('previewCanvas'),
    $sideCol: document.querySelector('#sideCol'),
    $score: document.getElementById('score'),
    $highScore: document.querySelector('#highScore'),
    $gameOver: document.querySelector('#gameOver'),
    $menu: document.querySelector('#menu'),
    $lines: document.querySelector('#lines'),
    $centerCol: document.querySelector('#centerCol'),
    context: {},
    pieceContext: {},
    previewContext: {},
    scale: Math.floor(window.innerHeight / GameDimension.HEIGHT),
    colors: [
        '#ff0000', // red
        '#0dff00', // green
        '#0905f7', // blue
        '#ffff00', // yellow
        '#ff8400', // orange
        '#9d00ff', // purply
        '#a1a1a1' // gray
    ],
    isDebug: false,

    init(isDebug: boolean) {
        this.$canvas.width = this.$pieceCanvas.width = GameDimension.WIDTH * this.scale;
        this.$canvas.height = this.$pieceCanvas.height = GameDimension.HEIGHT * this.scale;
        this.$previewCanvas.width = this.$previewCanvas.height = GameDimension.WIDTH / 4 * this.scale;

            this.$menu.style.width = Math.floor(this.$canvas.width / 2) + 'px';
            this.$menu.style.marginLeft = Math.floor(this.$canvas.width / 4) + 'px';
        this.$gameOver.style.width = Math.floor(this.$canvas.width / 2) + 'px';
        this.$gameOver.style.marginLeft = Math.floor(this.$canvas.width / 4) + 'px';
        this.$centerCol.style.width = this.$canvas.width + 'px';
        this.$centerCol.style.height = this.$canvas.height + 'px';

        this.context = this.$canvas.getContext('2d');
        this.pieceContext = this.$pieceCanvas.getContext('2d');
        this.previewContext = this.$previewCanvas.getContext('2d');

        this.context.font = '16px ariel';

        this.isDebug = isDebug;
    },
    hideMenu() {
        this.$menu.classList.add('d-none');
    },
    showGameOver() {
        this.$gameOver.classList.remove('d-none');
    },
    hideGameOver() {
        this.$gameOver.classList.add('d-none');
    },
    _drawGameboard(gameboard, context) {
        let x: number = 0;
        let y: number = 0;


        for (let i: number=0; i<gameboard.length; i++) {
            const char = gameboard[i];

            if (i > 0 && i % GameDimension.WIDTH === 0) {
                x = 0;
                y += this.scale;
            }

            context.strokeStyle = Color.DARK_GRAY;
            context.strokeRect(x, y, this.scale, this.scale);

            if (char === Tetromino.BLOCKED) {
                context.fillStyle = this.colors[6]; // gray
                context.fillRect(x, y, this.scale, this.scale);
            } else if (isPiece(char)) {
                context.fillStyle = this.colors[char];
                context.strokeStyle = Color.DARK_GRAY;
                context.fillRect(x, y, this.scale, this.scale);
                context.strokeRect(x, y, this.scale, this.scale);

            }

            if (this.isDebug) {
                context.fillStyle = 'red';
                context.fillText(`${i}`, x + 15, y + 15);
            }

            x += this.scale;
        }
    },
    drawPieceTiles(
        context, tiles: Array<number>,
        px: number, py: number,
        xScale: number, yScale: number) {
        for (let i = 0; i<tiles.length; i++) {
            // transform from piece space to gameboard space
            const { rowIndex, colIndex } = getPieceIndex(i);
            const x: number = (px + colIndex) * xScale;
            const y: number = (py + rowIndex) * yScale;
            const tile = getPieceTile(rowIndex, colIndex, tiles);
            if (tile !== Tetromino.EMPTY) {
                context.moveTo(x, y);
                context.lineTo(x + xScale, y);
                context.lineTo(x + xScale, y + yScale);
                context.lineTo(x, y + yScale);
                context.lineTo(x, y);
            }
        }
    },
    _drawPiece(piece, width, height, xScale, yScale, context, isPreview = false, clearContext = true, fill = true) {
        let { x: px, y: py, tiles, type } = piece;

        if (isPreview) {
            px = 1;
            py = 1;
        }

        if (clearContext) {
            context.clearRect(0, 0, width, height);
        }

        if (fill) {
            context.fillStyle = this.colors[type];
        } else {
            context.strokeWidth = 2;
            // orange
            context.strokeStyle = this.colors[4];
        }

        context.beginPath();
        this.drawPieceTiles(context, tiles, px, py, xScale, yScale);

        if (fill) {
            context.fill();
        } else {
            context.stroke();
        }
    },
    drawScore(score) {
      this.$score.innerHTML = score;
    },
    drawLines(lines) {
        this.$lines.innerHTML = lines;
    },
    drawHighScore(highScore) {
        this.$highScore.innerHTML = highScore;
    },

    drawPiece(currentPiece, dropPreviewPiece) {
        this._drawPiece(currentPiece,
            GameDimension.WIDTH * this.scale, GameDimension.HEIGHT * this.scale,
            this.scale, this.scale, this.pieceContext);

        this._drawPiece(dropPreviewPiece,
            GameDimension.WIDTH * this.scale, GameDimension.HEIGHT * this.scale,
            this.scale, this.scale, this.pieceContext, false, false, false);
    },
    drawGameboard(gameboard, nextPiece) {
            this.context.clearRect(0, 0, GameDimension.WIDTH * this.scale, GameDimension.HEIGHT * this.scale);
            this._drawGameboard(gameboard, this.context);

            this._drawPiece(nextPiece,
                GameDimension.WIDTH * this.scale, GameDimension.WIDTH * this.scale,
                30, 30,
                this.previewContext, true);
    }
}

export default display;
