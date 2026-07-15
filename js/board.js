console.log("BOARD LOADED");

const AVAILABLE_TILES = [
    { color: "#e63946", symbol: "●", textColor: "#ffffff" },
    { color: "#ffd166", symbol: "◆", textColor: "#1b1b1b" },
    { color: "#43aa8b", symbol: "▲", textColor: "#ffffff" },
    { color: "#277da1", symbol: "■", textColor: "#ffffff" },
    { color: "#7b2cbf", symbol: "✦", textColor: "#ffffff" },
    { color: "#f77f00", symbol: "✚", textColor: "#1b1b1b" },
    { color: "#ff4d9d", symbol: "♥", textColor: "#ffffff" },
    { color: "#00b4d8", symbol: "✿", textColor: "#102027" },
    { color: "#8d5524", symbol: "⬟", textColor: "#ffffff" },
    { color: "#b8de6f", symbol: "✕", textColor: "#17210d" },
    { color: "#ff8fab", symbol: "⬢", textColor: "#2b1018" },
    { color: "#4d908e", symbol: "☀", textColor: "#ffffff" },
    { color: "#f9c74f", symbol: "☾", textColor: "#211a05" },
    { color: "#577590", symbol: "★", textColor: "#ffffff" },
    { color: "#c77dff", symbol: "⬥", textColor: "#22102f" }
];

let SIZE = 4;
let SYMBOL_COUNT = 15;
let TILES = AVAILABLE_TILES.slice(0, SYMBOL_COUNT);
let COLORS = TILES.map((tile) => tile.color);
let gameBoard = [];

function setBoardConfiguration({ boardSize, symbolCount }) {
    SIZE = boardSize;
    SYMBOL_COUNT = symbolCount;
    TILES = AVAILABLE_TILES.slice(0, SYMBOL_COUNT);
    COLORS = TILES.map((tile) => tile.color);

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
                const tileDefinition = TILES[tileValue];
                cell.style.backgroundColor = tileDefinition.color;
                cell.style.color = tileDefinition.textColor;
                cell.textContent = tileDefinition.symbol;
                cell.setAttribute("aria-label", `Kámen ${tileValue + 1}`);
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
