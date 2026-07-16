import { applyMove, createInitialState, getLegalMoves, serializeState } from "./engine.js";
import { analyzeImmediateChoices, findEvaluatedMove } from "./decision-analysis.js";

function createDecisionStatistics() {
    return {
        analyzedTurns: 0,
        legalMovesTotal: 0,
        scoringMovesTotal: 0,
        zeroRewardMovesTotal: 0,
        winningMovesTotal: 0,
        bestMoveCountTotal: 0,
        nearBestMoveCountTotal: 0,
        distinctRewardValuesTotal: 0,
        availableRewardTotal: 0,
        bestAvailableRewardTotal: 0,
        chosenRewardTotal: 0,
        chosenBestImmediateTurns: 0,
        chosenScoringTurns: 0,
        zeroRewardChosenTurns: 0,
        totalImmediateRegret: 0,
        maximumImmediateRegret: 0
    };
}

export function playMatch({ config, playerAgents, random }) {
    let state = createInitialState(config, random);
    const repetitions = new Map();
    let longestNoScoreSequence = 0;
    const decisionStatistics = createDecisionStatistics();

    while (!state.endReason) {
        const key = serializeState(state);
        const count = (repetitions.get(key) ?? 0) + 1;
        repetitions.set(key, count);

        if (count >= state.config.repetitionLimit) {
            state.endReason = "repetition_limit";
            break;
        }
        if (state.turn >= state.config.maxTurns) {
            state.endReason = "max_turns";
            break;
        }
        if (state.turnsWithoutScore >= state.config.noScoreTurnLimit) {
            state.endReason = "no_score_limit";
            break;
        }

        const legalMoves = getLegalMoves(state);
        if (legalMoves.length === 0) {
            state.endReason = "no_legal_move";
            break;
        }

        const decision = analyzeImmediateChoices(state);
        const agent = playerAgents[state.activePlayer];
        const move = agent.chooseMove(state, random);
        if (!move) {
            state.endReason = "agent_failed";
            break;
        }

        const chosen = findEvaluatedMove(decision, move);
        if (!chosen) {
            state.endReason = "agent_illegal_move";
            break;
        }

        const regret = decision.bestReward - chosen.reward;
        decisionStatistics.analyzedTurns++;
        decisionStatistics.legalMovesTotal += decision.legalMoves;
        decisionStatistics.scoringMovesTotal += decision.scoringMoves;
        decisionStatistics.zeroRewardMovesTotal += decision.zeroRewardMoves;
        decisionStatistics.winningMovesTotal += decision.winningMoves;
        decisionStatistics.bestMoveCountTotal += decision.bestMoveCount;
        decisionStatistics.nearBestMoveCountTotal += decision.nearBestMoveCount;
        decisionStatistics.distinctRewardValuesTotal += decision.distinctRewardValues;
        decisionStatistics.availableRewardTotal += decision.averageReward;
        decisionStatistics.bestAvailableRewardTotal += decision.bestReward;
        decisionStatistics.chosenRewardTotal += chosen.reward;
        decisionStatistics.totalImmediateRegret += regret;
        decisionStatistics.maximumImmediateRegret = Math.max(decisionStatistics.maximumImmediateRegret, regret);
        if (chosen.reward === decision.bestReward) decisionStatistics.chosenBestImmediateTurns++;
        if (chosen.reward > 0) decisionStatistics.chosenScoringTurns++;
        if (chosen.reward === 0) decisionStatistics.zeroRewardChosenTurns++;

        state = applyMove(state, move, random).state;
        longestNoScoreSequence = Math.max(longestNoScoreSequence, state.turnsWithoutScore);
    }

    return {
        winner: state.winner,
        endReason: state.endReason,
        turns: state.turn,
        scores: [...state.scores],
        longestNoScoreSequence,
        repeatedPositions: [...repetitions.values()].filter((count) => count > 1).length,
        decisionStatistics,
        ...state.statistics
    };
}
