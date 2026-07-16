import { createConfig } from "./config.js";
import { randomInteger, shuffle } from "./random.js";

export function cloneState(state) {
    return {
        ...state,
        board: state.board.map((row) => [...row]),
        queues: state.queues.map((queue) => [...queue]),
        scores: [...state.scores],
        statistics: {
            ...state.statistics,
            matchGroupsByLength: { ...state.statistics.matchGroupsByLength }
        }
    };
}

function createsStartingMatch(board, row, col, tileValue) {
    const horizontal = col >= 2 && board[row][col - 1] === tileValue && board[row][col - 2] === tileValue;
    const vertical = row >= 2 && board[row - 1][col] === tileValue && board[row - 2][col] === tileValue;
    return horizontal || vertical;
}

export function createStartingBoard(config, random) {
    const board = [];

    for (let row = 0; row < config.boardSize; row++) {
        board.push([]);
        for (let col = 0; col < config.boardSize; col++) {
            const candidates = shuffle(
                Array.from({ length: config.symbolCount }, (_, value) => value),
                random
            );
            const tileValue = candidates.find((candidate) => !createsStartingMatch(board, row, col, candidate));
            board[row].push(tileValue);
        }
    }

    return board;
}

function createQueue(config, random) {
    return Array.from({ length: config.queueSize }, () => randomInteger(random, config.symbolCount));
}

export function createInitialState(configOverrides = {}, random = Math.random) {
    const config = createConfig(configOverrides);
    const sharedQueue = createQueue(config, random);
    const queues = config.sharedQueueEnabled
        ? [sharedQueue, [...sharedQueue]]
        : [createQueue(config, random), createQueue(config, random)];

    return {
        config,
        board: createStartingBoard(config, random),
        queues,
        scores: [config.startingScore, config.startingScore],
        activePlayer: 0,
        turn: 0,
        turnsWithoutScore: 0,
        winner: null,
        endReason: null,
        statistics: {
            totalReward: 0,
            scoringTurns: 0,
            cascades: 0,
            clearedTiles: 0,
            ejectedTiles: 0,
            matchGroupsByLength: {}
        }
    };
}

export function getLegalMoves(state) {
    if (state.endReason) return [];
    const moves = [];
    const size = state.config.boardSize;

    for (let index = 0; index < size; index++) {
        moves.push({ direction: "left", index });
        moves.push({ direction: "right", index });
        if (state.config.topInsertionEnabled) moves.push({ direction: "top", index });
        if (state.config.bottomInsertionEnabled) moves.push({ direction: "bottom", index });
    }

    return moves;
}

export function findMatchGroups(board) {
    const size = board.length;
    const groups = [];

    for (let row = 0; row < size; row++) {
        let start = 0;
        for (let col = 1; col <= size; col++) {
            const startValue = board[row][start];
            const same = startValue !== null && col < size && board[row][col] === startValue;
            if (same) continue;
            if (startValue !== null && col - start >= 3) {
                groups.push({
                    direction: "horizontal",
                    length: col - start,
                    cells: Array.from({ length: col - start }, (_, offset) => [row, start + offset])
                });
            }
            start = col;
        }
    }

    for (let col = 0; col < size; col++) {
        let start = 0;
        for (let row = 1; row <= size; row++) {
            const startValue = board[start][col];
            const same = startValue !== null && row < size && board[row][col] === startValue;
            if (same) continue;
            if (startValue !== null && row - start >= 3) {
                groups.push({
                    direction: "vertical",
                    length: row - start,
                    cells: Array.from({ length: row - start }, (_, offset) => [start + offset, col])
                });
            }
            start = row;
        }
    }

    return groups;
}

export function calculateGroupsReward(groups) {
    return groups.reduce((total, group) => total + Math.max(1, group.length - 2), 0);
}

function clearGroups(board, groups) {
    const unique = new Set();
    for (const group of groups) {
        for (const [row, col] of group.cells) unique.add(`${row},${col}`);
    }
    for (const key of unique) {
        const [row, col] = key.split(",").map(Number);
        board[row][col] = null;
    }
    return unique.size;
}

export function applyGravity(board) {
    const size = board.length;
    for (let col = 0; col < size; col++) {
        let targetRow = size - 1;
        for (let row = size - 1; row >= 0; row--) {
            if (board[row][col] === null) continue;
            board[targetRow][col] = board[row][col];
            targetRow--;
        }
        for (let row = targetRow; row >= 0; row--) board[row][col] = null;
    }
}

function insertTile(board, move, tileValue) {
    const size = board.length;
    let ejectedTile = null;

    if (move.direction === "left") {
        const row = board[move.index];
        const emptyIndex = row.indexOf(null);
        if (emptyIndex === -1) {
            ejectedTile = row[size - 1];
            for (let col = size - 1; col > 0; col--) row[col] = row[col - 1];
        } else {
            for (let col = emptyIndex; col > 0; col--) row[col] = row[col - 1];
        }
        row[0] = tileValue;
    } else if (move.direction === "right") {
        const row = board[move.index];
        const emptyIndex = row.lastIndexOf(null);
        if (emptyIndex === -1) {
            ejectedTile = row[0];
            for (let col = 0; col < size - 1; col++) row[col] = row[col + 1];
        } else {
            for (let col = emptyIndex; col < size - 1; col++) row[col] = row[col + 1];
        }
        row[size - 1] = tileValue;
    } else if (move.direction === "top") {
        let emptyRow = board.findIndex((row) => row[move.index] === null);
        if (emptyRow === -1) {
            ejectedTile = board[size - 1][move.index];
            emptyRow = size - 1;
        }
        for (let row = emptyRow; row > 0; row--) board[row][move.index] = board[row - 1][move.index];
        board[0][move.index] = tileValue;
    } else if (move.direction === "bottom") {
        let emptyRow = -1;
        for (let row = size - 1; row >= 0; row--) {
            if (board[row][move.index] === null) {
                emptyRow = row;
                break;
            }
        }
        if (emptyRow === -1) {
            ejectedTile = board[0][move.index];
            emptyRow = 0;
        }
        for (let row = emptyRow; row < size - 1; row++) board[row][move.index] = board[row + 1][move.index];
        board[size - 1][move.index] = tileValue;
    } else {
        throw new Error(`Neznámý směr tahu: ${move.direction}`);
    }

    return ejectedTile;
}

function consumeQueue(state, random) {
    const queueIndex = state.config.sharedQueueEnabled ? 0 : state.activePlayer;
    const queue = state.queues[queueIndex];
    const incomingTile = queue.shift();
    queue.push(randomInteger(random, state.config.symbolCount));
    if (state.config.sharedQueueEnabled) state.queues[1] = [...queue];
    return incomingTile;
}

export function applyMove(originalState, move, random = Math.random) {
    const legal = getLegalMoves(originalState).some(
        (candidate) => candidate.direction === move.direction && candidate.index === move.index
    );
    if (!legal) throw new Error(`Nelegální tah: ${JSON.stringify(move)}`);

    const state = cloneState(originalState);
    const incomingTile = consumeQueue(state, random);
    const ejectedTile = insertTile(state.board, move, incomingTile);
    if (ejectedTile !== null) state.statistics.ejectedTiles++;

    applyGravity(state.board);

    let turnReward = 0;
    let cascadeDepth = 0;
    let groups = findMatchGroups(state.board);

    while (groups.length > 0) {
        const reward = calculateGroupsReward(groups);
        turnReward += reward;
        if (cascadeDepth > 0) state.statistics.cascades++;

        for (const group of groups) {
            state.statistics.matchGroupsByLength[group.length] =
                (state.statistics.matchGroupsByLength[group.length] ?? 0) + 1;
        }

        state.statistics.clearedTiles += clearGroups(state.board, groups);
        applyGravity(state.board);
        cascadeDepth++;
        groups = findMatchGroups(state.board);
    }

    if (turnReward > 0) {
        const opponent = 1 - state.activePlayer;
        const transferred = Math.min(turnReward, state.scores[opponent]);
        state.scores[state.activePlayer] += transferred;
        state.scores[opponent] -= transferred;
        state.statistics.totalReward += transferred;
        state.statistics.scoringTurns++;
        state.turnsWithoutScore = 0;

        if (state.scores[opponent] === 0) {
            state.winner = state.activePlayer;
            state.endReason = "all_tokens_captured";
        }
    } else {
        state.turnsWithoutScore++;
    }

    state.turn++;
    if (!state.endReason) state.activePlayer = 1 - state.activePlayer;

    return {
        state,
        moveResult: { incomingTile, ejectedTile, reward: turnReward, cascadeDepth }
    };
}

export function serializeState(state) {
    return JSON.stringify({
        board: state.board,
        queues: state.queues,
        scores: state.scores,
        activePlayer: state.activePlayer
    });
}
