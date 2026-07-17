import { applyMove, findMatchGroups, getLegalMoves } from "./engine.js";

function countRunsAndGaps(board) {
    const size = board.length;
    let pairs = 0;
    let nearMatches = 0;

    const lines = [];
    for (let row = 0; row < size; row++) lines.push(board[row]);
    for (let col = 0; col < size; col++) lines.push(board.map((row) => row[col]));

    for (const line of lines) {
        for (let i = 0; i < line.length - 1; i++) {
            if (line[i] !== null && line[i] === line[i + 1]) pairs++;
        }
        for (let i = 0; i < line.length - 2; i++) {
            const window = line.slice(i, i + 3);
            const values = window.filter((value) => value !== null);
            if (values.length === 3 && new Set(values).size === 2) {
                const counts = new Map();
                for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
                if ([...counts.values()].includes(2)) nearMatches++;
            }
        }
    }

    return { pairs, nearMatches };
}

export function evaluatePositionPotential(state) {
    const { pairs, nearMatches } = countRunsAndGaps(state.board);
    const existingGroups = findMatchGroups(state.board).length;
    return pairs + nearMatches * 1.5 + existingGroups * 4;
}

export function evaluateMoveFeatures(state, move) {
    const result = applyMove(state, move, () => 0);
    const next = result.state;
    const opponent = 1 - state.activePlayer;
    const opponentMoves = next.endReason ? [] : getLegalMoves(next);
    let bestOpponentReward = 0;

    for (const reply of opponentMoves) {
        const replyResult = applyMove(next, reply, () => 0);
        bestOpponentReward = Math.max(bestOpponentReward, replyResult.moveResult.reward);
    }

    const beforePotential = evaluatePositionPotential(state);
    const afterPotential = evaluatePositionPotential(next);

    return {
        immediateReward: result.moveResult.reward,
        opponentBestReply: bestOpponentReward,
        potentialDelta: afterPotential - beforePotential,
        cascadeDepth: Math.max(0, result.moveResult.cascadeDepth - 1),
        mobility: opponentMoves.length,
        ejected: result.moveResult.ejectedTile === null ? 0 : 1,
        winningMove: next.winner === state.activePlayer ? 1 : 0,
        scoreLead: next.scores[state.activePlayer] - next.scores[opponent]
    };
}
