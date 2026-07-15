const LAB_DEFAULTS = {
    boardSize: 4,
    symbolCount: 9,
    queueSize: 2,
    animationDuration: 500,
    topInsertionEnabled: true,
    scoreDisplayEnabled: true
};

function resetBoard() {
    cancelActiveMove();

    createBoard();
    resetPlayerState();
    drawBoard();
    initInsertionControls();

    console.log("Laboratoř: vytvořena nová deska a resetováni hráči");
}

function createLabField(labelText, control) {
    const field = document.createElement("label");
    field.className = "debug-panel__field";

    const label = document.createElement("span");
    label.className = "debug-panel__label";
    label.textContent = labelText;

    field.appendChild(label);
    field.appendChild(control);

    return field;
}

function createSelect(options, value) {
    const select = document.createElement("select");
    select.className = "debug-panel__select";

    options.forEach((optionValue) => {
        const option = document.createElement("option");
        option.value = String(optionValue);
        option.textContent = String(optionValue);
        option.selected = optionValue === value;
        select.appendChild(option);
    });

    return select;
}

function applyLaboratorySettings(controls) {
    const settings = {
        boardSize: Number(controls.boardSize.value),
        symbolCount: Number(controls.symbolCount.value),
        queueSize: Number(controls.queueSize.value),
        animationDuration: Number(controls.animationDuration.value),
        topInsertionEnabled: controls.topInsertionEnabled.checked,
        scoreDisplayEnabled: controls.scoreDisplayEnabled.checked
    };

    setBoardConfiguration(settings);
    setInputConfiguration(settings);
    resetBoard();

    console.log("Laboratoř: použito nastavení", settings);
}

function initDebugPanel() {
    const existingPanel = document.querySelector(".debug-panel");
    existingPanel?.remove();

    const panel = document.createElement("aside");
    panel.className = "debug-panel";

    const header = document.createElement("div");
    header.className = "debug-panel__header";

    const title = document.createElement("h2");
    title.className = "debug-panel__title";
    title.textContent = "LABORATOŘ";

    const toggleButton = document.createElement("button");
    toggleButton.className = "debug-panel__toggle";
    toggleButton.type = "button";
    toggleButton.setAttribute("aria-expanded", "true");
    toggleButton.textContent = "Skrýt";

    header.appendChild(title);
    header.appendChild(toggleButton);

    const content = document.createElement("div");
    content.className = "debug-panel__content";

    const boardSize = createSelect([4, 5, 6], LAB_DEFAULTS.boardSize);
    const symbolCount = createSelect([4, 5, 6, 7, 8, 9], LAB_DEFAULTS.symbolCount);
    const queueSize = createSelect([1, 2, 3, 5], LAB_DEFAULTS.queueSize);
    const animationDuration = createSelect(
        [100, 250, 500, 1000, 1500],
        LAB_DEFAULTS.animationDuration
    );

    const topInsertionEnabled = document.createElement("input");
    topInsertionEnabled.type = "checkbox";
    topInsertionEnabled.className = "debug-panel__checkbox";
    topInsertionEnabled.checked = LAB_DEFAULTS.topInsertionEnabled;

    const scoreDisplayEnabled = document.createElement("input");
    scoreDisplayEnabled.type = "checkbox";
    scoreDisplayEnabled.className = "debug-panel__checkbox";
    scoreDisplayEnabled.checked = LAB_DEFAULTS.scoreDisplayEnabled;

    const applyButton = document.createElement("button");
    applyButton.className = "debug-panel__button";
    applyButton.type = "button";
    applyButton.textContent = "Použít a resetovat";

    const newBoardButton = document.createElement("button");
    newBoardButton.className = "debug-panel__button";
    newBoardButton.type = "button";
    newBoardButton.textContent = "Nová deska";

    const controls = {
        boardSize,
        symbolCount,
        queueSize,
        animationDuration,
        topInsertionEnabled,
        scoreDisplayEnabled
    };

    animationDuration.addEventListener("change", () => {
        ANIMATION_DURATION = Number(animationDuration.value);
        document.documentElement.style.setProperty(
            "--animation-duration",
            `${ANIMATION_DURATION}ms`
        );
    });

    topInsertionEnabled.addEventListener("change", () => {
        TOP_INSERTION_ENABLED = topInsertionEnabled.checked;
        updateTopInsertionVisibility();
    });

    scoreDisplayEnabled.addEventListener("change", () => {
        SCORE_DISPLAY_ENABLED = scoreDisplayEnabled.checked;
        updateScoreVisibility();
    });

    applyButton.addEventListener("click", () => {
        applyLaboratorySettings(controls);
    });

    newBoardButton.addEventListener("click", resetBoard);

    content.appendChild(createLabField("Deska", boardSize));
    content.appendChild(createLabField("Typy kamenů", symbolCount));
    content.appendChild(createLabField("Fronta", queueSize));
    content.appendChild(createLabField("Animace (ms)", animationDuration));
    content.appendChild(createLabField("Vkládání shora", topInsertionEnabled));
    content.appendChild(createLabField("Zobrazit skóre", scoreDisplayEnabled));
    content.appendChild(applyButton);
    content.appendChild(newBoardButton);

    const setCollapsed = (collapsed) => {
        panel.classList.toggle("debug-panel--collapsed", collapsed);
        toggleButton.setAttribute("aria-expanded", String(!collapsed));
        toggleButton.textContent = collapsed ? "Otevřít" : "Skrýt";
    };

    toggleButton.addEventListener("click", () => {
        setCollapsed(!panel.classList.contains("debug-panel--collapsed"));
    });

    panel.appendChild(header);
    panel.appendChild(content);
    document.body.appendChild(panel);

    setCollapsed(window.matchMedia("(max-width: 620px)").matches);
}

document.addEventListener("keydown", (event) => {
    if (event.repeat) return;

    if (event.key.toLowerCase() === "r") {
        resetBoard();
    }
});
