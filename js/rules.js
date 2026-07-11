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

function replaceMatches(matches) {
    matches.forEach(([row, col]) => {
        gameBoard[row][col] = Math.floor(Math.random() * COLORS.length);
    });
}

function animateMatches(matches) {
    matches.forEach(([row, col]) => {
        const cell = document.querySelector(
            `.cell[data-row="${row}"][data-col="${col}"]`
        );

        cell?.classList.add("cell--clearing");
    });
}
