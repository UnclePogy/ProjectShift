function resetBoard() {
    cancelActiveMove();

    createBoard();
    drawBoard();

    console.log("Debug: vytvořena nová deska");
}

function initDebugPanel() {
    const panel = document.createElement("aside");
    panel.className = "debug-panel";

    const title = document.createElement("h2");
    title.className = "debug-panel__title";
    title.textContent = "DEBUG";

    const newBoardButton = document.createElement("button");
    newBoardButton.className = "debug-panel__button";
    newBoardButton.type = "button";
    newBoardButton.textContent = "New Board";

    newBoardButton.addEventListener("click", resetBoard);

    panel.appendChild(title);
    panel.appendChild(newBoardButton);

    document.body.appendChild(panel);
}

document.addEventListener("keydown", (event) => {
    if (event.repeat) return;

    switch (event.key.toLowerCase()) {
        case "r":
            resetBoard();
            break;
    }
});