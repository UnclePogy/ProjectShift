document.addEventListener("click", (e) => {

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

});
