function animateMatches(matches) {
    matches.forEach(([row, col]) => {
        const cell = document.querySelector(
            `.cell[data-row="${row}"][data-col="${col}"]`
        );

        cell?.classList.add("cell--clearing");
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

    fallingTiles.forEach(({ row, col, distance }) => {
        const cell = document.querySelector(
            `.cell[data-row="${row}"][data-col="${col}"]`
        );

        cell?.style.setProperty("--fall-offset", `-${distance * step}px`);
        cell?.classList.add("cell--falling");
    });
}
