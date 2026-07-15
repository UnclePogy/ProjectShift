const LAB_DEFAULTS = {
    boardSize: 5,
    symbolCount: 10,
    queueSize: 2,
    startingScore: 7,
    sharedQueueEnabled: false,
    animationDuration: 500,
    topInsertionEnabled: true,
    bottomInsertionEnabled: false,
    scoreDisplayEnabled: true,
    queueTileScale: 110,
    symbolScale: 120,
    queueGap: 10
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

function createSelect(options, value, format = (item) => String(item)) {
    const select = document.createElement("select");
    select.className = "debug-panel__select";

    options.forEach((optionValue) => {
        const option = document.createElement("option");
        option.value = String(optionValue);
        option.textContent = format(optionValue);
        option.selected = optionValue === value;
        select.appendChild(option);
    });

    return select;
}

function readLaboratorySettings(controls) {
    return {
        boardSize: Number(controls.boardSize.value),
        symbolCount: Number(controls.symbolCount.value),
        queueSize: Number(controls.queueSize.value),
        startingScore: Number(controls.startingScore.value),
        sharedQueueEnabled: controls.sharedQueueEnabled.checked,
        animationDuration: Number(controls.animationDuration.value),
        topInsertionEnabled: controls.topInsertionEnabled.checked,
        bottomInsertionEnabled: controls.bottomInsertionEnabled.checked,
        scoreDisplayEnabled: controls.scoreDisplayEnabled.checked,
        queueTileScale: Number(controls.queueTileScale.value),
        symbolScale: Number(controls.symbolScale.value),
        queueGap: Number(controls.queueGap.value)
    };
}

function applyLaboratorySettings(controls) {
    const settings = readLaboratorySettings(controls);
    setBoardConfiguration(settings);
    setInputConfiguration(settings);
    resetBoard();
    console.log("Laboratoř: použito nastavení", settings);
}

function initDebugPanel() {
    document.querySelector(".debug-panel")?.remove();

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

    const percentOptions = Array.from({ length: 11 }, (_, index) => 100 + index * 10);
    const boardSize = createSelect([4, 5, 6], LAB_DEFAULTS.boardSize);
    const symbolCount = createSelect(Array.from({ length: 12 }, (_, index) => index + 4), LAB_DEFAULTS.symbolCount);
    const queueSize = createSelect([1, 2, 3, 5], LAB_DEFAULTS.queueSize);
    const startingScore = createSelect(Array.from({ length: 15 }, (_, index) => index + 1), LAB_DEFAULTS.startingScore);
    const queueTileScale = createSelect(percentOptions, LAB_DEFAULTS.queueTileScale, (value) => `${value} %`);
    const symbolScale = createSelect(percentOptions, LAB_DEFAULTS.symbolScale, (value) => `${value} %`);
    const queueGap = createSelect([0, 5, 10, 15, 20, 25, 30], LAB_DEFAULTS.queueGap, (value) => `${value} px`);

    const sharedQueueEnabled = document.createElement("input");
    sharedQueueEnabled.type = "checkbox";
    sharedQueueEnabled.className = "debug-panel__checkbox";
    sharedQueueEnabled.checked = LAB_DEFAULTS.sharedQueueEnabled;

    const animationDuration = createSelect([100, 250, 500, 1000, 1500], LAB_DEFAULTS.animationDuration);

    const topInsertionEnabled = document.createElement("input");
    topInsertionEnabled.type = "checkbox";
    topInsertionEnabled.className = "debug-panel__checkbox";
    topInsertionEnabled.checked = LAB_DEFAULTS.topInsertionEnabled;

    const bottomInsertionEnabled = document.createElement("input");
    bottomInsertionEnabled.type = "checkbox";
    bottomInsertionEnabled.className = "debug-panel__checkbox";
    bottomInsertionEnabled.checked = LAB_DEFAULTS.bottomInsertionEnabled;

    const scoreDisplayEnabled = document.createElement("input");
    scoreDisplayEnabled.type = "checkbox";
    scoreDisplayEnabled.className = "debug-panel__checkbox";
    scoreDisplayEnabled.checked = LAB_DEFAULTS.scoreDisplayEnabled;

    const applyButton = document.createElement("button");
    applyButton.className = "debug-panel__button";
    applyButton.type = "button";
    applyButton.textContent = "Použít a resetovat";

    const defaultsButton = document.createElement("button");
    defaultsButton.className = "debug-panel__button";
    defaultsButton.type = "button";
    defaultsButton.textContent = "Výchozí nastavení";

    const newBoardButton = document.createElement("button");
    newBoardButton.className = "debug-panel__button";
    newBoardButton.type = "button";
    newBoardButton.textContent = "Nová deska";

    const controls = {
        boardSize,
        symbolCount,
        queueSize,
        startingScore,
        sharedQueueEnabled,
        animationDuration,
        topInsertionEnabled,
        bottomInsertionEnabled,
        scoreDisplayEnabled,
        queueTileScale,
        symbolScale,
        queueGap
    };

    animationDuration.addEventListener("change", () => {
        ANIMATION_DURATION = Number(animationDuration.value);
        document.documentElement.style.setProperty("--animation-duration", `${ANIMATION_DURATION}ms`);
    });

    scoreDisplayEnabled.addEventListener("change", () => {
        SCORE_DISPLAY_ENABLED = scoreDisplayEnabled.checked;
        updateScoreVisibility();
    });

    [queueTileScale, symbolScale, queueGap].forEach((control) => {
        control.addEventListener("change", () => {
            const settings = readLaboratorySettings(controls);
            setInputConfiguration(settings);
            updatePlayerDisplays();
        });
    });

    applyButton.addEventListener("click", () => applyLaboratorySettings(controls));

    defaultsButton.addEventListener("click", () => {
        Object.entries(LAB_DEFAULTS).forEach(([key, value]) => {
            const control = controls[key];
            if (!control) return;
            if (control.type === "checkbox") control.checked = value;
            else control.value = String(value);
        });
        applyLaboratorySettings(controls);
    });

    newBoardButton.addEventListener("click", resetBoard);

    content.appendChild(createLabField("Deska", boardSize));
    content.appendChild(createLabField("Typy kamenů", symbolCount));
    content.appendChild(createLabField("Fronta", queueSize));
    content.appendChild(createLabField("Velikost fronty", queueTileScale));
    content.appendChild(createLabField("Velikost symbolů", symbolScale));
    content.appendChild(createLabField("Rozestup fronty", queueGap));
    content.appendChild(createLabField("Počáteční body", startingScore));
    content.appendChild(createLabField("Společná fronta", sharedQueueEnabled));
    content.appendChild(createLabField("Animace (ms)", animationDuration));
    content.appendChild(createLabField("Vkládání shora", topInsertionEnabled));
    content.appendChild(createLabField("Vkládání odspodu", bottomInsertionEnabled));
    content.appendChild(createLabField("Zobrazit skóre", scoreDisplayEnabled));
    content.appendChild(applyButton);
    content.appendChild(defaultsButton);
    content.appendChild(newBoardButton);

    const setCollapsed = (collapsed) => {
        panel.classList.toggle("debug-panel--collapsed", collapsed);
        toggleButton.setAttribute("aria-expanded", String(!collapsed));
        toggleButton.textContent = collapsed ? "Otevřít" : "Skrýt";
    };

    toggleButton.addEventListener("click", () => setCollapsed(!panel.classList.contains("debug-panel--collapsed")));

    panel.appendChild(header);
    panel.appendChild(content);
    document.body.appendChild(panel);
    setCollapsed(window.matchMedia("(max-width: 620px)").matches);
}

document.addEventListener("keydown", (event) => {
    if (!event.repeat && event.key.toLowerCase() === "r") resetBoard();
});
