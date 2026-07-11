console.log("BOARD LOADED");
const SIZE = 5;

const COLORS = [
    "#ff595e",
    "#ffca3a",
    "#8ac926",
    "#1982c4",
    "#6a4c93"
];

let gameBoard = [];

function createBoard() {
    gameBoard = [];

    for (let row = 0; row < SIZE; row++) {
        const newRow = [];

        for (let col = 0; col < SIZE; col++) {
            newRow.push(
                Math.floor(Math.random() * COLORS.length)
            );
        }

        gameBoard.push(newRow);
    }
}

function drawBoard(appearingMatches = []) {
    const board = document.getElementById("board");
    board.innerHTML = "";
    const appearingCells = new Set(
        appearingMatches.map(([row, col]) => `${row},${col}`)
    );

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            const cell = document.createElement("div");

            cell.className = "cell";
            if (appearingCells.has(`${row},${col}`)) {
                cell.classList.add("cell--appearing");
            }
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.style.backgroundColor =
                COLORS[gameBoard[row][col]];

            board.appendChild(cell);
        }
    }
}

function shiftRowRight(rowIndex) {

    const row = gameBoard[rowIndex];

    const last = row[row.length - 1];

    for (let i = row.length - 1; i > 0; i--) {
        row[i] = row[i - 1];
    }

    row[0] = last;

    drawBoard();
}

function shiftColumnDown(colIndex) {

    const last = gameBoard[SIZE - 1][colIndex];

    for (let i = SIZE - 1; i > 0; i--) {
        gameBoard[i][colIndex] = gameBoard[i - 1][colIndex];
    }

    gameBoard[0][colIndex] = last;

    drawBoard();
}
