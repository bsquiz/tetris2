const GameDimension = {
    WIDTH: 10,
    HEIGHT: 16
};

const Tetrominos = [[], [], [], [], [], [], []];

enum Key {
    RIGHT = 'ArrowRight',
    LEFT = 'ArrowLeft',
    UP = 'ArrowUp',
    DOWN = 'ArrowDown',
    SPACE = 'Space'
}

enum Color {
    DARK_GRAY = '2e2e2e'
}

enum Tetromino {
    L,
    J,
    I,
    SQUARE,
    Z,
    S,
    TRIANGLE,
    EMPTY,
    BLOCKED
}

Tetrominos[0] = [
    0,7,7,7,
    0,7,7,7,
    0,0,7,7,
    7,7,7,7
];
Tetrominos[1] = [
    7,7,1,7,
    7,7,1,7,
    7,1,1,7,
    7,7,7,7
];
Tetrominos[2] = [
    7,7,2,7,
    7,7,2,7,
    7,7,2,7,
    7,7,2,7
];
Tetrominos[3] = [
    7,7,7,7,
    7,3,3,7,
    7,3,3,7,
    7,7,7,7
];
Tetrominos[4] = [
    7,7,7,7,
    4,4,7,7,
    7,4,4,7,
    7,7,7,7
];
Tetrominos[5] = [
    7,7,7,7,
    7,5,5,7,
    5,5,7,7,
    7,7,7,7
];
Tetrominos[6] = [
    7,7,7,7,
    7,6,7,7,
    6,6,6,7,
    7,7,7,7
];

export { GameDimension, Tetrominos, Tetromino, Key, Color };
