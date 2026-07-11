function animateMatches(matches) {
    matches.forEach(([row, col]) => {
        const cell = document.querySelector(
            `.cell[data-row="${row}"][data-col="${col}"]`
        );

        cell?.classList.add("cell--clearing");
    });
}

function animateGravity(fallingTiles) {
    fallingTiles.forEach(({ row, col, distance }) => {
        const cell = document.querySelector(
            `.cell[data-row="${row}"][data-col="${col}"]`
        );

        cell?.style.setProperty("--fall-offset", `-${distance * 75}px`);
        cell?.classList.add("cell--falling");
    });
}