function findHorizontalMatches() {
    const matches = [];

    for (let row = 0; row < SIZE; row++) {
        let start = 0;

        for (let col = 1; col <= SIZE; col++) {
            const sameColor =
                col < SIZE &&
                gameBoard[row][col] === gameBoard[row][start];

            if (sameColor) continue;

            if (col - start >= 3) {
                for (let matchCol = start; matchCol < col; matchCol++) {
                    matches.push([row, matchCol]);
                }
            }

            start = col;
        }
    }

    return matches;
}

function findVerticalMatches() {
    const matches = [];

    for (let col = 0; col < SIZE; col++) {
        let start = 0;

        for (let row = 1; row <= SIZE; row++) {
            const sameColor =
                row < SIZE &&
                gameBoard[row][col] === gameBoard[start][col];

            if (sameColor) continue;

            if (row - start >= 3) {
                for (let matchRow = start; matchRow < row; matchRow++) {
                    matches.push([matchRow, col]);
                }
            }

            start = row;
        }
    }

    return matches;
}

function findMatches() {
    return [
        ...findHorizontalMatches(),
        ...findVerticalMatches()
    ];
}

function createRandomTile() {
    return Math.floor(Math.random() * COLORS.length);
}

function clearMatches(matches) {
    matches.forEach(([row, col]) => {
        gameBoard[row][col] = null;
    });
}

function applyGravity() {
    const newTiles = [];
    const fallingTiles = [];

    for (let col = 0; col < SIZE; col++) {
        let targetRow = SIZE - 1;

        for (let row = SIZE - 1; row >= 0; row--) {
            if (gameBoard[row][col] === null) continue;

            gameBoard[targetRow][col] = gameBoard[row][col];

            if (targetRow !== row) {
                fallingTiles.push({
                    row: targetRow,
                    col,
                    distance: targetRow - row
                });
            }

            targetRow--;
        }

        for (let row = targetRow; row >= 0; row--) {
            gameBoard[row][col] = createRandomTile();
            newTiles.push([row, col]);
        }
    }

    return { newTiles, fallingTiles };
}