interface RowCol {
    rowIndex: number,
    colIndex: number
}

interface TetrominoType {
    x: number,
    y: number,
    tiles: number[],
    rotation: number,
    type: number
}

export { RowCol, TetrominoType }
