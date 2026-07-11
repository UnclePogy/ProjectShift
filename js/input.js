let isResolvingMove = false;

const activeTimeouts = new Set();

function scheduleTimeout(callback, delay) {
    const timeoutId = setTimeout(() => {
        activeTimeouts.delete(timeoutId);
        callback();
    }, delay);

    activeTimeouts.add(timeoutId);

    return timeoutId;
}

function cancelActiveMove() {
    activeTimeouts.forEach((timeoutId) => {
        clearTimeout(timeoutId);
    });

    activeTimeouts.clear();
    isResolvingMove = false;
}

function resolveMatches(matches) {
    console.log("Kombinace:", matches);
    animateMatches(matches);

    scheduleTimeout(() => {
        clearMatches(matches);
        const gravity = applyGravity();
        drawBoard(gravity.newTiles);
        animateGravity(gravity.fallingTiles);

        scheduleTimeout(() => {
            const nextMatches = findMatches();

            if (nextMatches.length > 0) {
                resolveMatches(nextMatches);
            } else {
                isResolvingMove = false;
            }
        }, 500);
    }, 500);
}

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

    if (matches.length > 0) {
        isResolvingMove = true;
        resolveMatches(matches);
    } else {
        console.log("Kombinace:", matches);
    }

});
