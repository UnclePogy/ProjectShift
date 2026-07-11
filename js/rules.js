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