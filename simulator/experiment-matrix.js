function cartesianProduct(dimensions) {
    return dimensions.reduce(
        (rows, [key, values]) => rows.flatMap((row) => values.map((value) => ({ ...row, [key]: value }))),
        [{}]
    );
}

export function buildExperimentMatrix(spec) {
    const dimensions = [
        ["boardSize", spec.boardSizes ?? [5]],
        ["symbolCount", spec.symbolCounts ?? [8]],
        ["queueSize", spec.queueSizes ?? [2]],
        ["sharedQueueEnabled", spec.sharedQueueModes ?? [false]],
        ["topInsertionEnabled", spec.topInsertionModes ?? [true]],
        ["bottomInsertionEnabled", spec.bottomInsertionModes ?? [false]],
        ["startingScore", spec.startingScores ?? [7]]
    ];
    return cartesianProduct(dimensions).map((config, index) => ({
        id: `config-${String(index + 1).padStart(4, "0")}`,
        config: { ...spec.baseConfig, ...config }
    }));
}

export function aggregateLeagueMetrics(leagueResult) {
    const summaries = leagueResult.matchups.map((matchup) => matchup.summary);
    const totalGames = summaries.reduce((sum, summary) => sum + summary.games, 0);
    const unresolvedGames = summaries.reduce((sum, summary) => sum + summary.winnerCounts.unresolved, 0);
    const resolvedGames = summaries.reduce((sum, summary) => sum + summary.resolvedGames, 0);
    const player1Wins = summaries.reduce((sum, summary) => sum + summary.winnerCounts.player1, 0);
    const totalTurns = summaries.reduce((sum, summary) => sum + summary.turns.average * summary.games, 0);

    return {
        totalGames,
        unresolvedRate: totalGames ? unresolvedGames / totalGames : 0,
        averageTurns: totalGames ? totalTurns / totalGames : 0,
        firstPlayerWinRateResolved: resolvedGames ? player1Wins / resolvedGames : null,
        resolvedGames
    };
}

export function applyScreeningFilters(leagueResult, filters = {}) {
    const metrics = aggregateLeagueMetrics(leagueResult);
    const firstPlayerDeviation = metrics.firstPlayerWinRateResolved === null
        ? null
        : Math.abs(metrics.firstPlayerWinRateResolved - 0.5);

    const reasons = [];
    if (metrics.unresolvedRate > (filters.maxAverageUnresolvedRate ?? 0.6)) reasons.push("too_many_unresolved_games");
    if (metrics.averageTurns > (filters.maxAverageTurns ?? 180)) reasons.push("games_too_long");
    if (firstPlayerDeviation !== null && firstPlayerDeviation > (filters.maxFirstPlayerDeviation ?? 0.35)) {
        reasons.push("first_player_imbalance");
    }
    if (metrics.resolvedGames === 0) reasons.push("no_resolved_games");

    return {
        passed: reasons.length === 0,
        reasons,
        metrics: {
            averageUnresolved: metrics.unresolvedRate,
            averageTurns: metrics.averageTurns,
            firstPlayerWinRateResolved: metrics.firstPlayerWinRateResolved,
            firstPlayerDeviation,
            resolvedGames: metrics.resolvedGames,
            totalGames: metrics.totalGames
        }
    };
}
