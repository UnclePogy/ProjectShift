function findHorizontalMatchGroups() {
    const groups = [];

    for (let row = 0; row < SIZE; row++) {
        let start = 0;

        for (let col = 1; col <= SIZE; col++) {
            const startValue = gameBoard[row][start];
            const sameColor =
                startValue !== null &&
                col < SIZE &&
                gameBoard[row][col] === startValue;

            if (sameColor) continue;

            if (startValue !== null && col - start >= 3) {
                const cells = [];

                for (let matchCol = start; matchCol < col; matchCol++) {
                    cells.push([row, matchCol]);
                }

                groups.push({
                    direction: "horizontal",
                    length: cells.length,
                    cells
                });
            }

            start = col;
        }
    }

    return groups;
}

function findVerticalMatchGroups() {
    const groups = [];

    for (let col = 0; col < SIZE; col++) {
        let start = 0;

        for (let row = 1; row <= SIZE; row++) {
            const startValue = gameBoard[start][col];
            const sameColor =
                startValue !== null &&
                row < SIZE &&
                gameBoard[row][col] === startValue;

            if (sameColor) continue;

            if (startValue !== null && row - start >= 3) {
                const cells = [];

                for (let matchRow = start; matchRow < row; matchRow++) {
                    cells.push([matchRow, col]);
                }

                groups.push({
                    direction: "vertical",
                    length: cells.length,
                    cells
                });
            }

            start = row;
        }
    }

    return groups;
}

function findMatchGroups() {
    return [
        ...findHorizontalMatchGroups(),
        ...findVerticalMatchGroups()
    ];
}

function findMatches() {
    const uniqueMatches = new Map();

    findMatchGroups().forEach((group) => {
        group.cells.forEach(([row, col]) => {
            uniqueMatches.set(`${row},${col}`, [row, col]);
        });
    });

    return [...uniqueMatches.values()];
}

function calculateMatchReward() {
    return findMatchGroups().reduce((total, group) => {
        return total + Math.max(1, group.length - 2);
    }, 0);
}

function clearMatches(matches) {
    matches.forEach(([row, col]) => {
        gameBoard[row][col] = null;
    });
}

function applyGravity() {
    const fallingTiles = [];

    for (let col = 0; col < SIZE; col++) {
        let targetRow = SIZE - 1;

        for (let row = SIZE - 1; row >= 0; row--) {
            const tile = gameBoard[row][col];

            if (tile === null) continue;

            gameBoard[targetRow][col] = tile;

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
            gameBoard[row][col] = null;
        }
    }

    return { fallingTiles };
}
