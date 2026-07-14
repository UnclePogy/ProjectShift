let isResolvingMove = false;
let activeDrag = null;
let activePlayerIndex = 0;
let playerQueues = [];
let playerScores = [];
let gameOver = false;

const PLAYER_COUNT = 2;
const STARTING_SCORE = 7;
const TOTAL_SCORE_TOKENS = STARTING_SCORE * PLAYER_COUNT;
let VISIBLE_QUEUE_SIZE = 3;
let ANIMATION_DURATION = 500;
let TOP_INSERTION_ENABLED = true;
let SCORE_DISPLAY_ENABLED = true;

const DRAG_THRESHOLD = 24;
const MAX_CONTROL_TRAVEL = 22;
const activeTimeouts = new Set();

function setInputConfiguration({
    queueSize,
    animationDuration,
    topInsertionEnabled,
    scoreDisplayEnabled
}) {
    VISIBLE_QUEUE_SIZE = queueSize;
    ANIMATION_DURATION = animationDuration;
    TOP_INSERTION_ENABLED = topInsertionEnabled;
    SCORE_DISPLAY_ENABLED = scoreDisplayEnabled;

    document.documentElement.style.setProperty(
        "--animation-duration",
        `${ANIMATION_DURATION}ms`
    );

    updateTopInsertionVisibility();
    updateScoreVisibility();
}

function createPlayerQueue() {
    return Array.from(
        { length: VISIBLE_QUEUE_SIZE },
        () => createRandomTile()
    );
}

function resetPlayerState() {
    activePlayerIndex = 0;
    playerQueues = Array.from(
        { length: PLAYER_COUNT },
        () => createPlayerQueue()
    );
    playerScores = Array.from(
        { length: PLAYER_COUNT },
        () => STARTING_SCORE
    );
    gameOver = false;

    hideWinnerMessage();
    updatePlayerDisplays();
}

function getCurrentIncomingTile() {
    return playerQueues[activePlayerIndex][0];
}

function consumeCurrentTile() {
    const queue = playerQueues[activePlayerIndex];

    queue.shift();
    queue.push(createRandomTile());
}

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
    cancelInsertionDrag();
    clearTargetHighlight();
    isResolvingMove = false;
}

function createQueueTile(tileValue, index) {
    const tile = document.createElement("span");

    tile.className = "player-queue__tile";
    tile.style.backgroundColor = COLORS[tileValue];
    tile.setAttribute("aria-hidden", "true");

    if (index === 0) {
        tile.classList.add("player-queue__tile--current");
    }

    return tile;
}

function createScoreToken() {
    const token = document.createElement("span");
    token.className = "player-score__token";
    token.setAttribute("aria-hidden", "true");
    return token;
}

function updateScoreDisplays() {
    playerScores.forEach((score, playerIndex) => {
        const scoreElement = document.getElementById(`player-score-${playerIndex}`);

        if (!scoreElement) return;

        scoreElement.innerHTML = "";
        scoreElement.setAttribute(
            "aria-label",
            `Hráč ${playerIndex + 1} má ${score} ikon`
        );

        for (let index = 0; index < score; index++) {
            scoreElement.appendChild(createScoreToken());
        }
    });

    updateScoreVisibility();
}

function updateScoreVisibility() {
    document.querySelectorAll(".player-score").forEach((scoreElement) => {
        scoreElement.hidden = !SCORE_DISPLAY_ENABLED;
    });
}

function updatePlayerDisplays() {
    playerQueues.forEach((queue, playerIndex) => {
        const panel = document.getElementById(`player-panel-${playerIndex}`);
        const queueElement = document.getElementById(`player-queue-${playerIndex}`);
        const turnElement = document.getElementById(`player-turn-${playerIndex}`);
        const isActive = playerIndex === activePlayerIndex && !gameOver;

        panel?.classList.toggle("player-panel--active", isActive);

        if (turnElement) {
            turnElement.textContent = gameOver
                ? "KONEC"
                : isActive
                    ? "NA TAHU"
                    : "ČEKÁ";
        }

        if (!queueElement) return;

        queueElement.innerHTML = "";

        queue.forEach((tileValue, index) => {
            queueElement.appendChild(createQueueTile(tileValue, index));
        });
    });

    updateScoreDisplays();
    updateInsertionControlColors();
}

function updateInsertionControlColors() {
    if (gameOver || playerQueues.length === 0) return;

    const incomingTile = getCurrentIncomingTile();

    document.querySelectorAll(".insertion-control").forEach((control) => {
        control.style.backgroundColor = COLORS[incomingTile];
    });
}

function transferScoreToActivePlayer(amount) {
    if (amount <= 0 || gameOver) return;

    const opponentIndex = (activePlayerIndex + 1) % PLAYER_COUNT;
    const transferable = Math.min(amount, playerScores[opponentIndex]);

    playerScores[activePlayerIndex] += transferable;
    playerScores[opponentIndex] -= transferable;

    console.log("Přesun ikon:", {
        player: activePlayerIndex + 1,
        requested: amount,
        transferred: transferable,
        scores: [...playerScores]
    });

    updateScoreDisplays();

    if (playerScores[activePlayerIndex] >= TOTAL_SCORE_TOKENS) {
        gameOver = true;
        showWinnerMessage(activePlayerIndex);
        updatePlayerDisplays();
    }
}

function showWinnerMessage(playerIndex) {
    const message = document.getElementById("winner-message");

    if (!message) return;

    message.textContent = `Hráč ${playerIndex + 1} vyhrál`;
    message.hidden = false;
}

function hideWinnerMessage() {
    const message = document.getElementById("winner-message");

    if (!message) return;

    message.textContent = "";
    message.hidden = true;
}

function createInsertionControl(direction, index) {
    const control = document.createElement("button");

    control.type = "button";
    control.className = "insertion-control";
    control.dataset.direction = direction;
    control.dataset.index = index;

    if (direction === "left") {
        control.textContent = "→";
        control.setAttribute("aria-label", `Vložit kámen zleva do řádku ${index + 1}`);
    } else if (direction === "right") {
        control.textContent = "←";
        control.setAttribute("aria-label", `Vložit kámen zprava do řádku ${index + 1}`);
    } else {
        control.textContent = "↓";
        control.setAttribute("aria-label", `Vložit kámen shora do sloupce ${index + 1}`);
    }

    control.addEventListener("pointerdown", startInsertionDrag);
    control.addEventListener("pointermove", updateInsertionDrag);
    control.addEventListener("pointerup", finishInsertionDrag);
    control.addEventListener("pointercancel", cancelInsertionDrag);

    return control;
}

function initInsertionControls() {
    const leftControls = document.getElementById("left-controls");
    const rightControls = document.getElementById("right-controls");
    const topControls = document.getElementById("top-controls");

    leftControls.innerHTML = "";
    rightControls.innerHTML = "";
    topControls.innerHTML = "";

    for (let index = 0; index < SIZE; index++) {
        leftControls.appendChild(createInsertionControl("left", index));
        rightControls.appendChild(createInsertionControl("right", index));
        topControls.appendChild(createInsertionControl("top", index));
    }

    updateTopInsertionVisibility();
    updatePlayerDisplays();
}

function updateTopInsertionVisibility() {
    const topControls = document.getElementById("top-controls");

    if (!topControls) return;

    topControls.hidden = !TOP_INSERTION_ENABLED;
}

function getInwardDistance(event, drag) {
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    if (drag.direction === "left") return deltaX;
    if (drag.direction === "right") return -deltaX;
    return deltaY;
}

function getControlTransform(direction, distance) {
    const travel = Math.max(0, Math.min(distance, MAX_CONTROL_TRAVEL));

    if (direction === "left") return `translateX(${travel}px)`;
    if (direction === "right") return `translateX(${-travel}px)`;
    return `translateY(${travel}px)`;
}

function startInsertionDrag(event) {
    if (isResolvingMove || activeDrag || gameOver) return;

    const control = event.currentTarget;
    const direction = control.dataset.direction;

    if (direction === "top" && !TOP_INSERTION_ENABLED) return;

    activeDrag = {
        control,
        pointerId: event.pointerId,
        direction,
        index: Number(control.dataset.index),
        startX: event.clientX,
        startY: event.clientY,
        ready: false
    };

    control.setPointerCapture(event.pointerId);
    control.classList.add("insertion-control--dragging");
    highlightTarget(activeDrag.direction, activeDrag.index);
    event.preventDefault();
}

function updateInsertionDrag(event) {
    if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;

    const distance = getInwardDistance(event, activeDrag);
    activeDrag.ready = distance >= DRAG_THRESHOLD;

    activeDrag.control.style.transform = getControlTransform(
        activeDrag.direction,
        distance
    );

    activeDrag.control.classList.toggle(
        "insertion-control--ready",
        activeDrag.ready
    );

    event.preventDefault();
}

function finishInsertionDrag(event) {
    if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;

    const move = {
        direction: activeDrag.direction,
        index: activeDrag.index,
        ready: activeDrag.ready
    };

    cancelInsertionDrag();
    clearTargetHighlight();

    if (!move.ready) return;

    performInsertion(move.direction, move.index);
    event.preventDefault();
}

function cancelInsertionDrag() {
    if (!activeDrag) return;

    const { control, pointerId } = activeDrag;

    if (control.hasPointerCapture?.(pointerId)) {
        control.releasePointerCapture(pointerId);
    }

    control.classList.remove(
        "insertion-control--dragging",
        "insertion-control--ready"
    );
    control.style.transform = "";
    activeDrag = null;
    clearTargetHighlight();
}

function highlightTarget(direction, index) {
    clearTargetHighlight();

    const selector = direction === "top"
        ? `.cell[data-col="${index}"]`
        : `.cell[data-row="${index}"]`;

    document.querySelectorAll(selector).forEach((cell) => {
        cell.classList.add("cell--target");
    });
}

function clearTargetHighlight() {
    document.querySelectorAll(".cell--target").forEach((cell) => {
        cell.classList.remove("cell--target");
    });
}

function performInsertion(direction, index) {
    if (isResolvingMove || gameOver) return;
    if (direction === "top" && !TOP_INSERTION_ENABLED) return;

    isResolvingMove = true;

    const playerIndex = activePlayerIndex;
    const incomingTile = getCurrentIncomingTile();
    let ejectedTile = null;

    if (direction === "left") {
        ejectedTile = insertRowFromLeft(index, incomingTile);
    } else if (direction === "right") {
        ejectedTile = insertRowFromRight(index, incomingTile);
    } else {
        ejectedTile = insertColumnFromTop(index, incomingTile);
    }

    console.log("Vložen kámen:", {
        player: playerIndex + 1,
        direction,
        index,
        tile: incomingTile,
        ejectedTile
    });

    consumeCurrentTile();
    updatePlayerDisplays();
    drawBoard();
    applyGravityAfterMove();
}

function switchPlayer() {
    activePlayerIndex = (activePlayerIndex + 1) % PLAYER_COUNT;
    updatePlayerDisplays();
}

function completeTurn() {
    isResolvingMove = false;

    if (!gameOver) {
        switchPlayer();
    }
}

function finishMoveResolution() {
    const matches = findMatches();

    if (matches.length > 0) {
        resolveMatches(matches);
    } else {
        console.log("Kombinace:", matches);
        completeTurn();
    }
}

function applyGravityAfterMove() {
    const gravity = applyGravity();

    if (gravity.fallingTiles.length === 0) {
        finishMoveResolution();
        return;
    }

    drawBoard();
    animateGravity(gravity.fallingTiles);

    scheduleTimeout(() => {
        finishMoveResolution();
    }, ANIMATION_DURATION);
}

function resolveMatches(matches) {
    const reward = calculateMatchReward();

    console.log("Kombinace:", matches, "Odměna:", reward);
    transferScoreToActivePlayer(reward);
    animateMatches(matches);

    scheduleTimeout(() => {
        clearMatches(matches);

        const gravity = applyGravity();

        drawBoard();
        animateGravity(gravity.fallingTiles);

        scheduleTimeout(() => {
            const nextMatches = findMatches();

            if (nextMatches.length > 0) {
                resolveMatches(nextMatches);
            } else {
                completeTurn();
            }
        }, ANIMATION_DURATION);
    }, ANIMATION_DURATION);
}
