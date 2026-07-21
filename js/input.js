let isResolvingMove = false;
let activeDrag = null;
let activePlayerIndex = 0;
let playerQueues = [];
let sharedQueue = [];
let playerScores = [];
let gameOver = false;

const AI_PLAYER_INDEX = 1;
const AI_MOVE_DELAY = 1200;
let AI_ENABLED = true;

const PLAYER_COUNT = 2;
let STARTING_SCORE = 7;
let TOTAL_SCORE_TOKENS = STARTING_SCORE * PLAYER_COUNT;
let VISIBLE_QUEUE_SIZE = 2;
let SHARED_QUEUE_ENABLED = true;
let ANIMATION_DURATION = 500;
let TOP_INSERTION_ENABLED = true;
let BOTTOM_INSERTION_ENABLED = false;
let SCORE_DISPLAY_ENABLED = true;
let QUEUE_TILE_SCALE = 110;
let SYMBOL_SCALE = 120;
let QUEUE_GAP = 10;

const DRAG_THRESHOLD = 24;
const activeTimeouts = new Set();

function setInputConfiguration({
    queueSize,
    animationDuration,
    topInsertionEnabled,
    bottomInsertionEnabled,
    scoreDisplayEnabled,
    startingScore,
    sharedQueueEnabled,
    queueTileScale,
    symbolScale,
    queueGap
}) {
    VISIBLE_QUEUE_SIZE = queueSize;
    ANIMATION_DURATION = animationDuration;
    TOP_INSERTION_ENABLED = topInsertionEnabled;
    BOTTOM_INSERTION_ENABLED = bottomInsertionEnabled;
    SCORE_DISPLAY_ENABLED = scoreDisplayEnabled;
    STARTING_SCORE = startingScore;
    TOTAL_SCORE_TOKENS = STARTING_SCORE * PLAYER_COUNT;
    SHARED_QUEUE_ENABLED = sharedQueueEnabled;
    QUEUE_TILE_SCALE = queueTileScale;
    SYMBOL_SCALE = symbolScale;
    QUEUE_GAP = queueGap;

    document.documentElement.style.setProperty("--animation-duration", `${ANIMATION_DURATION}ms`);
    document.documentElement.style.setProperty("--queue-tile-scale", String(QUEUE_TILE_SCALE / 100));
    document.documentElement.style.setProperty("--symbol-scale", String(SYMBOL_SCALE / 100));
    document.documentElement.style.setProperty("--queue-gap", `${QUEUE_GAP}px`);

    updateScoreVisibility();
}

function createPlayerQueue() {
    return Array.from({ length: VISIBLE_QUEUE_SIZE }, () => createRandomTile());
}

function resetPlayerState() {
    activePlayerIndex = 0;
    sharedQueue = createPlayerQueue();
    playerQueues = SHARED_QUEUE_ENABLED
        ? Array.from({ length: PLAYER_COUNT }, () => sharedQueue)
        : Array.from({ length: PLAYER_COUNT }, () => createPlayerQueue());
    playerScores = Array.from({ length: PLAYER_COUNT }, () => STARTING_SCORE);
    gameOver = false;

    hideWinnerMessage();
    updatePlayerDisplays();
}

function getCurrentIncomingTile() {
    const queue = SHARED_QUEUE_ENABLED ? sharedQueue : playerQueues[activePlayerIndex];
    return queue[0];
}

function consumeCurrentTile() {
    const queue = SHARED_QUEUE_ENABLED ? sharedQueue : playerQueues[activePlayerIndex];
    queue.shift();
    queue.push(createRandomTile());

    if (SHARED_QUEUE_ENABLED) {
        playerQueues = Array.from({ length: PLAYER_COUNT }, () => sharedQueue);
    }
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
    activeTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    activeTimeouts.clear();
    cancelBoardDrag();
    clearTargetHighlight();
    isResolvingMove = false;
}

function createQueueTile(tileValue, index) {
    const tile = document.createElement("span");
    const tileDefinition = TILES[tileValue];

    tile.className = "player-queue__tile";
    tile.style.backgroundColor = tileDefinition.color;
    tile.style.color = tileDefinition.textColor;
    tile.textContent = tileDefinition.symbol;
    tile.setAttribute("aria-label", `Tile ${tileValue + 1}`);

    if (index === 0) tile.classList.add("player-queue__tile--current");
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
        scoreElement.setAttribute("aria-label", `Player ${playerIndex + 1} has ${score} tokens`);
        for (let index = 0; index < score; index++) scoreElement.appendChild(createScoreToken());
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
        if (turnElement) turnElement.textContent = gameOver ? "GAME OVER" : isActive ? "TURN" : "WAITING";
        if (!queueElement) return;

        queueElement.hidden = SHARED_QUEUE_ENABLED;
        queueElement.innerHTML = "";
        if (!SHARED_QUEUE_ENABLED) queue.forEach((tileValue, index) => queueElement.appendChild(createQueueTile(tileValue, index)));
    });

    const sharedQueuePanel = document.getElementById("shared-queue-panel");
    const sharedQueueElement = document.getElementById("shared-queue");
    if (sharedQueuePanel && sharedQueueElement) {
        sharedQueuePanel.hidden = !SHARED_QUEUE_ENABLED;
        sharedQueueElement.innerHTML = "";
        if (SHARED_QUEUE_ENABLED) sharedQueue.forEach((tileValue, index) => sharedQueueElement.appendChild(createQueueTile(tileValue, index)));
    }

    const turnBanner = document.getElementById("turn-banner");
    if (turnBanner) {
        turnBanner.textContent = gameOver ? "GAME OVER" : `PLAYER ${activePlayerIndex + 1} TURN`;
        turnBanner.dataset.player = String(activePlayerIndex + 1);
    }

    document.body.dataset.activePlayer = String(activePlayerIndex + 1);
    updateScoreDisplays();
}

function transferScoreToActivePlayer(amount) {
    if (amount <= 0 || gameOver) return;

    const opponentIndex = (activePlayerIndex + 1) % PLAYER_COUNT;
    const transferable = Math.min(amount, playerScores[opponentIndex]);
    playerScores[activePlayerIndex] += transferable;
    playerScores[opponentIndex] -= transferable;
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
    message.textContent = `Player ${playerIndex + 1} wins`;
    message.hidden = false;
}

function hideWinnerMessage() {
    const message = document.getElementById("winner-message");
    if (!message) return;
    message.textContent = "";
    message.hidden = true;
}

function initInsertionControls() {
    const board = document.getElementById("board");
    if (!board) return;

    board.removeEventListener("pointerdown", startBoardDrag);
    board.addEventListener("pointerdown", startBoardDrag);
    updatePlayerDisplays();
}

function getCandidateDirections(row, col) {
    const candidates = [];
    if (col === 0) candidates.push("left");
    if (col === SIZE - 1) candidates.push("right");
    if (row === 0 && TOP_INSERTION_ENABLED) candidates.push("top");
    if (row === SIZE - 1 && BOTTOM_INSERTION_ENABLED) candidates.push("bottom");
    return candidates;
}

function getInwardDistance(direction, deltaX, deltaY) {
    if (direction === "left") return deltaX;
    if (direction === "right") return -deltaX;
    if (direction === "top") return deltaY;
    return -deltaY;
}

function chooseDragDirection(candidates, deltaX, deltaY) {
    let bestDirection = null;
    let bestDistance = 0;

    candidates.forEach((direction) => {
        const distance = getInwardDistance(direction, deltaX, deltaY);
        if (distance > bestDistance) {
            bestDistance = distance;
            bestDirection = direction;
        }
    });

    return { direction: bestDirection, distance: bestDistance };
}

function startBoardDrag(event) {
    if (
        isResolvingMove ||
        activeDrag ||
        gameOver ||
        (AI_ENABLED && activePlayerIndex === AI_PLAYER_INDEX)
    ) return;

    const cell = event.target.closest?.(".cell");
    if (!cell) return;

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    const candidates = getCandidateDirections(row, col);
    if (candidates.length === 0) return;

    activeDrag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        row,
        col,
        candidates,
        direction: null,
        ready: false
    };

    const board = document.getElementById("board");
    board.setPointerCapture(event.pointerId);
    board.addEventListener("pointermove", updateBoardDrag);
    board.addEventListener("pointerup", finishBoardDrag);
    board.addEventListener("pointercancel", cancelBoardDrag);
    board.addEventListener("lostpointercapture", cancelBoardDrag);
    cell.classList.add("cell--drag-source");
    event.preventDefault();
}

function updateBoardDrag(event) {
    if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;

    const deltaX = event.clientX - activeDrag.startX;
    const deltaY = event.clientY - activeDrag.startY;
    const choice = chooseDragDirection(activeDrag.candidates, deltaX, deltaY);

    activeDrag.direction = choice.direction;
    activeDrag.ready = choice.distance >= DRAG_THRESHOLD;
    clearTargetHighlight();

    if (activeDrag.direction) {
        const index = ["left", "right"].includes(activeDrag.direction) ? activeDrag.row : activeDrag.col;
        highlightTarget(activeDrag.direction, index);
    }

    event.preventDefault();
}

function finishBoardDrag(event) {
    if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;

    const direction = activeDrag.direction;
    const index = ["left", "right"].includes(direction) ? activeDrag.row : activeDrag.col;
    const ready = activeDrag.ready;

    cancelBoardDrag();
    if (ready && direction) performInsertion(direction, index);
    event.preventDefault();
}

function cancelBoardDrag() {
    if (!activeDrag) return;

    const board = document.getElementById("board");
    if (board?.hasPointerCapture?.(activeDrag.pointerId)) board.releasePointerCapture(activeDrag.pointerId);
    board?.removeEventListener("pointermove", updateBoardDrag);
    board?.removeEventListener("pointerup", finishBoardDrag);
    board?.removeEventListener("pointercancel", cancelBoardDrag);
    board?.removeEventListener("lostpointercapture", cancelBoardDrag);

    document.querySelectorAll(".cell--drag-source").forEach((cell) => cell.classList.remove("cell--drag-source"));
    activeDrag = null;
    clearTargetHighlight();
}

function highlightTarget(direction, index) {
    clearTargetHighlight();
    const selector = ["top", "bottom"].includes(direction)
        ? `.cell[data-col="${index}"]`
        : `.cell[data-row="${index}"]`;

    document.querySelectorAll(selector).forEach((cell) => cell.classList.add("cell--target"));
}

function clearTargetHighlight() {
    document.querySelectorAll(".cell--target").forEach((cell) => cell.classList.remove("cell--target"));
}

function getLegalMoves() {
    const moves = [];

    for (let index = 0; index < SIZE; index++) {
        moves.push({ direction: "left", index });
        moves.push({ direction: "right", index });

        if (TOP_INSERTION_ENABLED) {
            moves.push({ direction: "top", index });
        }

        if (BOTTOM_INSERTION_ENABLED) {
            moves.push({ direction: "bottom", index });
        }
    }

    return moves;
}

function simulateMoveReward(direction, index, incomingTile) {
    const originalBoard = gameBoard.map((row) => [...row]);

    if (direction === "left") {
        insertRowFromLeft(index, incomingTile);
    } else if (direction === "right") {
        insertRowFromRight(index, incomingTile);
    } else if (direction === "top") {
        insertColumnFromTop(index, incomingTile);
    } else if (direction === "bottom") {
        insertColumnFromBottom(index, incomingTile);
    }

    applyGravity();
    const reward = calculateMatchReward();

    gameBoard = originalBoard;
    return reward;
}

function chooseGreedyMove() {
    const incomingTile = getCurrentIncomingTile();
    const evaluatedMoves = getLegalMoves().map((move) => ({
        ...move,
        reward: simulateMoveReward(
            move.direction,
            move.index,
            incomingTile
        )
    }));

    const bestReward = Math.max(
        ...evaluatedMoves.map((move) => move.reward)
    );

    const bestMoves = evaluatedMoves.filter(
        (move) => move.reward === bestReward
    );

    return bestMoves[
        Math.floor(Math.random() * bestMoves.length)
    ];
}

function performAIMove() {
    if (
        !AI_ENABLED ||
        gameOver ||
        isResolvingMove ||
        activePlayerIndex !== AI_PLAYER_INDEX
    ) {
        return;
    }

    const move = chooseGreedyMove();
    if (!move) return;

    highlightTarget(move.direction, move.index);

    scheduleTimeout(() => {
        clearTargetHighlight();
        performInsertion(move.direction, move.index);
    }, 700);
}




function performInsertion(direction, index) {
    if (isResolvingMove || gameOver) return;
    if (direction === "top" && !TOP_INSERTION_ENABLED) return;
    if (direction === "bottom" && !BOTTOM_INSERTION_ENABLED) return;

    isResolvingMove = true;
    const incomingTile = getCurrentIncomingTile();

    if (direction === "left") insertRowFromLeft(index, incomingTile);
    else if (direction === "right") insertRowFromRight(index, incomingTile);
    else if (direction === "top") insertColumnFromTop(index, incomingTile);
    else insertColumnFromBottom(index, incomingTile);

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

    if (gameOver) return;

    switchPlayer();

    if (
        AI_ENABLED &&
        activePlayerIndex === AI_PLAYER_INDEX
    ) {
        scheduleTimeout(performAIMove, AI_MOVE_DELAY);
    }
}



function finishMoveResolution() {
    const matches = findMatches();
    if (matches.length > 0) resolveMatches(matches);
    else completeTurn();
}

function applyGravityAfterMove() {
    const gravity = applyGravity();
    if (gravity.fallingTiles.length === 0) {
        finishMoveResolution();
        return;
    }

    drawBoard();
    animateGravity(gravity.fallingTiles);
    scheduleTimeout(finishMoveResolution, ANIMATION_DURATION);
}

function resolveMatches(matches) {
    const reward = calculateMatchReward();
    transferScoreToActivePlayer(reward);
    animateMatches(matches);

    scheduleTimeout(() => {
        clearMatches(matches);
        const gravity = applyGravity();
        drawBoard();
        animateGravity(gravity.fallingTiles);

        scheduleTimeout(() => {
            const nextMatches = findMatches();
            if (nextMatches.length > 0) resolveMatches(nextMatches);
            else completeTurn();
        }, ANIMATION_DURATION);
    }, ANIMATION_DURATION);
}

function preventGameGesture(event) {
    if (event.target.closest?.(".game-shell")) event.preventDefault();
}

document.addEventListener("gesturestart", preventGameGesture, { passive: false });
document.addEventListener("contextmenu", preventGameGesture);
window.addEventListener("blur", cancelBoardDrag);

document.addEventListener("selectstart", (event) => {
    if (activeDrag || event.target.closest?.(".game-shell, .debug-panel")) event.preventDefault();
});
