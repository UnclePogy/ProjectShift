let isResolvingMove = false;

document.addEventListener("click", (e) => {

    if (isResolvingMove) return;

    const cell = e.target;

    if (!cell.classList.contains("cell")) return;

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    console.log("Klik:", row, col);

    if (e.shiftKey) {
        shiftColumnDown(col);
    } else {
        shiftRowRight(row);
    }

    const matches = findMatches();
    console.log("Kombinace:", matches);

    if (matches.length > 0) {
        isResolvingMove = true;
        animateMatches(matches);

        setTimeout(() => {
            replaceMatches(matches);
            drawBoard(matches);
            isResolvingMove = false;
        }, 250);
    }

});
