function percentile(sortedValues, ratio) {
    if (sortedValues.length === 0) return 0;
    const index = Math.ceil(ratio * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
}

function average(values) {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function ratio(part, total) {
    return total ? part / total : 0;
}

export function summarizeResults(results) {
    const turns = results.map((result) => result.turns).sort((a, b) => a - b);
    const noScoreSequences = results.map((result) => result.longestNoScoreSequence).sort((a, b) => a - b);
    const endReasons = {};
    const winnerCounts = { player1: 0, player2: 0, unresolved: 0 };
    const matchGroupsByLength = {};

    for (const result of results) {
        endReasons[result.endReason] = (endReasons[result.endReason] ?? 0) + 1;
        if (result.winner === 0) winnerCounts.player1++;
        else if (result.winner === 1) winnerCounts.player2++;
        else winnerCounts.unresolved++;

        for (const [length, count] of Object.entries(result.matchGroupsByLength)) {
            matchGroupsByLength[length] = (matchGroupsByLength[length] ?? 0) + count;
        }
    }

    const resolvedGames = winnerCounts.player1 + winnerCounts.player2;
    const decisions = results.reduce((total, result) => {
        for (const [key, value] of Object.entries(result.decisionStatistics)) {
            total[key] = (total[key] ?? 0) + value;
        }
        return total;
    }, {});
    const analyzedTurns = decisions.analyzedTurns ?? 0;

    return {
        games: results.length,
        winnerCounts,
        resolvedGames,
        unresolvedRate: ratio(winnerCounts.unresolved, results.length),
        firstPlayerWinRate: ratio(winnerCounts.player1, results.length),
        firstPlayerWinRateResolved: ratio(winnerCounts.player1, resolvedGames),
        endReasons,
        turns: {
            average: average(turns),
            median: percentile(turns, 0.5),
            p90: percentile(turns, 0.9),
            p99: percentile(turns, 0.99),
            maximum: turns.at(-1) ?? 0,
            averageResolved: average(results.filter((result) => result.winner !== null).map((result) => result.turns)),
            averageUnresolved: average(results.filter((result) => result.winner === null).map((result) => result.turns))
        },
        longestNoScoreSequence: {
            average: average(noScoreSequences),
            p90: percentile(noScoreSequences, 0.9),
            maximum: noScoreSequences.at(-1) ?? 0
        },
        averagesPerGame: {
            totalReward: average(results.map((result) => result.totalReward)),
            scoringTurns: average(results.map((result) => result.scoringTurns)),
            cascades: average(results.map((result) => result.cascades)),
            clearedTiles: average(results.map((result) => result.clearedTiles)),
            ejectedTiles: average(results.map((result) => result.ejectedTiles))
        },
        decisionQuality: {
            analyzedTurns,
            averageLegalMoves: ratio(decisions.legalMovesTotal, analyzedTurns),
            averageScoringMoves: ratio(decisions.scoringMovesTotal, analyzedTurns),
            scoringMoveShare: ratio(decisions.scoringMovesTotal, decisions.legalMovesTotal),
            averageZeroRewardMoves: ratio(decisions.zeroRewardMovesTotal, analyzedTurns),
            zeroRewardMoveShare: ratio(decisions.zeroRewardMovesTotal, decisions.legalMovesTotal),
            averageWinningMoves: ratio(decisions.winningMovesTotal, analyzedTurns),
            averageBestMoveCount: ratio(decisions.bestMoveCountTotal, analyzedTurns),
            averageNearBestMoveCount: ratio(decisions.nearBestMoveCountTotal, analyzedTurns),
            averageDistinctRewardValues: ratio(decisions.distinctRewardValuesTotal, analyzedTurns),
            averageRewardAcrossAvailableMoves: ratio(decisions.availableRewardTotal, analyzedTurns),
            averageBestAvailableReward: ratio(decisions.bestAvailableRewardTotal, analyzedTurns),
            averageChosenReward: ratio(decisions.chosenRewardTotal, analyzedTurns),
            chosenBestImmediateRate: ratio(decisions.chosenBestImmediateTurns, analyzedTurns),
            chosenScoringRate: ratio(decisions.chosenScoringTurns, analyzedTurns),
            zeroRewardChosenRate: ratio(decisions.zeroRewardChosenTurns, analyzedTurns),
            averageImmediateRegret: ratio(decisions.totalImmediateRegret, analyzedTurns),
            maximumImmediateRegret: decisions.maximumImmediateRegret ?? 0
        },
        matchGroupsByLength
    };
}
