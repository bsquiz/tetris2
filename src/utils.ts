import { RowCol, TetrominoType } from "./types.js";
import { GameDimension, Tetromino, Tetrominos } from './constants.js';
import Game from "./game";
import game from "./game";

const getPieceIndex = function getPieceIndex(index: number): RowCol {
    const colIndex =  index % 4;
    const rowIndex = Math.floor(index / 4);

    return { rowIndex, colIndex };
}

const rotate = function rotate(x: number, y: number, rotation: number): number {
    // 0 = 0, 1 = 90, 2 = 180, 3 = 270
    let index;

    switch (rotation) {
        case 0:
            index = y * 4 + x;
            break;
        case 1:
            index = 12 + y - (x * 4);
            break;
        case 2:
            index = 15 - (y * 4) - x;
            break;
        case 3:
            index = 3 - y + (x * 4);
            break;

        default: break;
    }

    return index;
}

const rotatePiece = function rotatePiece(pieceTiles: number[], rotation: number): number[] {
    const transform = new Array(pieceTiles.length);

    for (let i=0; i<pieceTiles.length; i++) {
        const {rowIndex, colIndex} = getPieceIndex(i);
        const index = rotate(colIndex, rowIndex, rotation);

        transform[i] = pieceTiles[index];
    }

    return transform;
}

const getNewPiece = function getNewPiece(): TetrominoType {
    const type = Math.floor(Math.random() * 7);
    let y = 0;

    if (type === Tetromino.S || type === Tetromino.Z || type === Tetromino.SQUARE || type === Tetromino.TRIANGLE) {
        y = -1;
    }
    return {
        x: 4,
        y,
        tiles: Tetrominos[type],
        rotation: 0,
        type
    };
}

const copyPieceToGameboard = function copyPieceToGameboard(piece, gameboard) {
    const { x, y, tiles } = piece;
    const copy = [...gameboard];

    for (let i: number=0; i<tiles.length; i++) {
        const { rowIndex, colIndex } = getPieceIndex(i);
        const tile = getPieceTile(rowIndex, colIndex, tiles);
        const gameboardRowIndex: number = ((rowIndex + y) * GameDimension.WIDTH);
        const gameboardColIndex: number = colIndex + x;

        if (tile !== Tetromino.EMPTY) {
            copy[gameboardRowIndex + gameboardColIndex] = piece.type;
        }
    }

    return copy;
}

const pieceCanMove = function pieceCanMove(
    pieceX: number, pieceY: number,
    pieceTiles: number[], gameboard: number[],
    dx: number, dy: number
): boolean {

    for (let i: number=0; i<pieceTiles.length; i++) {
        if (pieceTiles[i] === Tetromino.EMPTY) {
            continue;
        }
        const { rowIndex, colIndex } = getPieceIndex(i);
        const futureX = pieceX + colIndex + dx;
        const futureY = pieceY + rowIndex + dy;
        const tile = getPieceTile(rowIndex, colIndex, pieceTiles);
        const gameboardRowIndex: number = ((futureY) * GameDimension.WIDTH);
        const gameboardColIndex: number = futureX;
        const gameboardTile: number = gameboard[gameboardRowIndex + gameboardColIndex];

        if (futureX >= GameDimension.WIDTH || futureX < 0) {
            return false;
        }

        if (tile !== Tetromino.EMPTY) {
            if (gameboardTile !== Tetromino.EMPTY) {
                return false;
            }
        }
    }

    return true;
}

const checkClearedRows = function checkClearedRows(gameboard): number[] {
    let clearedTiles: number = 0;
    let clearedRows: number[] = [];
    const startTile = GameDimension.WIDTH - 1; // first row is ceiling
    const endTile = gameboard.length;

    for (let i=startTile; i<endTile; i++) {
        const tile:number = gameboard[i];

        if (i % GameDimension.WIDTH === 0) {
            // beginning of new row
            clearedTiles = 0;
        }

        if (tile !== Tetromino.EMPTY) {
            clearedTiles += 1;

            if (clearedTiles === GameDimension.WIDTH) {
                const beginningOfRow = i - GameDimension.WIDTH;

                clearedRows.push(beginningOfRow);
            }
        }
    }

    return clearedRows;
}

const isPiece = function isPiece(type: number): boolean {
    return type !== Tetromino.BLOCKED && type !== Tetromino.EMPTY;
}

const rowColIndex = function rowColIndex(row: number, col: number): number {
    return row * GameDimension.WIDTH + col;
}

const getPieceTile = function getPieceTile(rowIndex: number, colIndex: number, tiles): number {
    return tiles[rowIndex * 4 + colIndex];
}

export {
    rotate, rotatePiece, getNewPiece, copyPieceToGameboard, pieceCanMove,
    checkClearedRows, isPiece, rowColIndex, getPieceTile, getPieceIndex
}
