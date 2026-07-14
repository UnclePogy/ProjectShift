console.log("BOARD LOADED");

const AVAILABLE_COLORS = [
    "#ff595e",
    "#ffca3a",
    "#8ac926",
    "#1982c4",
    "#6a4c93",
    "#00b4d8",
    "#f15bb5"
];

let SIZE = 4;
let SYMBOL_COUNT = 5;
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

function createBoard() {
    gameBoard = [];

    for (let row = 0; row < SIZE; row++) {
        const newRow = [];

        for (let col = 0; col < SIZE; col++) {
            newRow.push(createRandomTile());
        }

        gameBoard.push(newRow);
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
