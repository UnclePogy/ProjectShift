function animateMatches(matches) {
    const cells = matches
        .map(([row, col]) => document.querySelector(
            `.cell[data-row="${row}"][data-col="${col}"]`
        ))
        .filter(Boolean);

    if (cells.length === 0) return;

    cells.forEach((cell) => cell.classList.remove("cell--clearing"));

    const board = document.getElementById("board");
    void board?.offsetWidth;

    requestAnimationFrame(() => {
        cells.forEach((cell) => cell.classList.add("cell--clearing"));
    });
}

function animateGravity(fallingTiles) {
    const sampleCell = document.querySelector(".cell");
    const board = document.getElementById("board");

    if (!sampleCell || !board) return;

    const cellHeight = sampleCell.getBoundingClientRect().height;
    const boardStyles = getComputedStyle(board);
    const rowGap = Number.parseFloat(boardStyles.rowGap) || 0;
    const step = cellHeight + rowGap;
    const cells = [];

    fallingTiles.forEach(({ row, col, distance }) => {
        const cell = document.querySelector(
            `.cell[data-row="${row}"][data-col="${col}"]`
        );

        if (!cell) return;

        cell.style.setProperty("--fall-offset", `-${distance * step}px`);
        cell.classList.remove("cell--falling");
        cells.push(cell);
    });

    void board.offsetWidth;

    requestAnimationFrame(() => {
        cells.forEach((cell) => cell.classList.add("cell--falling"));
    });
}
