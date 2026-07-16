import { applyMove, getLegalMoves } from "./engine.js";

function average(values) {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function analyzeImmediateChoices(state) {
    const evaluatedMoves = getLegalMoves(state).map((move) => {
        const result = applyMove(state, move, () => 0);
        return {
            move,
            reward: result.moveResult.reward,
            cascadeDepth: result.moveResult.cascadeDepth,
            endsGame: result.state.endReason === "all_tokens_captured"
        };
    });

    if (evaluatedMoves.length === 0) {
        return {
            evaluatedMoves,
            legalMoves: 0,
            scoringMoves: 0,
            zeroRewardMoves: 0,
            winningMoves: 0,
            bestReward: 0,
            worstReward: 0,
            averageReward: 0,
            bestMoveCount: 0,
            nearBestMoveCount: 0,
            distinctRewardValues: 0
        };
    }

    const rewards = evaluatedMoves.map((entry) => entry.reward);
    const bestReward = Math.max(...rewards);
    const worstReward = Math.min(...rewards);

    return {
        evaluatedMoves,
        legalMoves: evaluatedMoves.length,
        scoringMoves: evaluatedMoves.filter((entry) => entry.reward > 0).length,
        zeroRewardMoves: evaluatedMoves.filter((entry) => entry.reward === 0).length,
        winningMoves: evaluatedMoves.filter((entry) => entry.endsGame).length,
        bestReward,
        worstReward,
        averageReward: average(rewards),
        bestMoveCount: evaluatedMoves.filter((entry) => entry.reward === bestReward).length,
        nearBestMoveCount: evaluatedMoves.filter((entry) => entry.reward >= Math.max(0, bestReward - 1)).length,
        distinctRewardValues: new Set(rewards).size
    };
}

export function findEvaluatedMove(analysis, move) {
    return analysis.evaluatedMoves.find(
        (entry) => entry.move.direction === move.direction && entry.move.index === move.index
    ) ?? null;
}
