console.log("BOARD LOADED");

const AVAILABLE_COLORS = [
    "#e63946", // červená
    "#ffd166", // žlutá
    "#43aa8b", // zelená
    "#277da1", // modrá
    "#7b2cbf", // fialová
    "#f77f00", // oranžová
    "#ff4d9d", // růžová
    "#00b4d8", // tyrkysová
    "#8d5524"  // hnědá
];

let SIZE = 4;
let SYMBOL_COUNT = 9;
let COLORS = AVAILABLE_COLORS.slice(0, SYMBOL_COUNT);
let gameBoard = [];

function setBoardConfiguration({ boardSize, symbolCount }) {
    SIZE = boardSize;
    SYMBOL_COUNT = symbolCount;
    COLORS = AVAILABLE_COLORS.slice(0, SYMBOL_COUNT);

    document.documentElement.style.setProperty("--board-size", SIZE);
}

function createRandomTile() {
    return Math.floor(Math.random() * COLORS.length);
}

function shuffleValues(values) {
    for (let index = values.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [values[index], values[randomIndex]] = [values[randomIndex], values[index]];
    }

    return values;
}

function createsStartingMatch(row, col, tileValue) {
    const createsHorizontalMatch =
        col >= 2 &&
        gameBoard[row][col - 1] === tileValue &&
        gameBoard[row][col - 2] === tileValue;

    const createsVerticalMatch =
        row >= 2 &&
        gameBoard[row - 1][col] === tileValue &&
        gameBoard[row - 2][col] === tileValue;

    return createsHorizontalMatch || createsVerticalMatch;
}

function createBoard() {
    gameBoard = [];

    for (let row = 0; row < SIZE; row++) {
        gameBoard.push([]);

        for (let col = 0; col < SIZE; col++) {
            const candidates = shuffleValues(
                Array.from({ length: COLORS.length }, (_, value) => value)
            );
            const tileValue = candidates.find(
                (candidate) => !createsStartingMatch(row, col, candidate)
            );

            gameBoard[row].push(tileValue);
        }
    }
}

function drawBoard() {
    const board = document.getElementById("board");
    board.innerHTML = "";

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            const cell = document.createElement("div");
            const tileValue = gameBoard[row][col];

            cell.className = "cell";
            cell.dataset.row = row;
            cell.dataset.col = col;

            if (tileValue === null) {
                cell.classList.add("cell--empty");
            } else {
                cell.style.backgroundColor = COLORS[tileValue];
            }

            board.appendChild(cell);
        }
    }
}

function insertRowFromLeft(rowIndex, tileValue) {
    const row = gameBoard[rowIndex];
    const emptyIndex = row.indexOf(null);
    let ejectedTile = null;

    if (emptyIndex === -1) {
        ejectedTile = row[SIZE - 1];

        for (let col = SIZE - 1; col > 0; col--) {
            row[col] = row[col - 1];
        }
    } else {
        for (let col = emptyIndex; col > 0; col--) {
            row[col] = row[col - 1];
        }
    }

    row[0] = tileValue;
    return ejectedTile;
}

function insertRowFromRight(rowIndex, tileValue) {
    const row = gameBoard[rowIndex];
    const emptyIndex = row.lastIndexOf(null);
    let ejectedTile = null;

    if (emptyIndex === -1) {
        ejectedTile = row[0];

        for (let col = 0; col < SIZE - 1; col++) {
            row[col] = row[col + 1];
        }
    } else {
        for (let col = emptyIndex; col < SIZE - 1; col++) {
            row[col] = row[col + 1];
        }
    }

    row[SIZE - 1] = tileValue;
    return ejectedTile;
}

function insertColumnFromTop(colIndex, tileValue) {
    let emptyRow = -1;
    let ejectedTile = null;

    for (let row = 0; row < SIZE; row++) {
        if (gameBoard[row][colIndex] === null) {
            emptyRow = row;
            break;
        }
    }

    if (emptyRow === -1) {
        ejectedTile = gameBoard[SIZE - 1][colIndex];
        emptyRow = SIZE - 1;
    }

    for (let row = emptyRow; row > 0; row--) {
        gameBoard[row][colIndex] = gameBoard[row - 1][colIndex];
    }

    gameBoard[0][colIndex] = tileValue;
    return ejectedTile;
}
