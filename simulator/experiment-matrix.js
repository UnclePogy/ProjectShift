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

export function applyScreeningFilters(leagueResult, filters = {}) {
    const summaries = leagueResult.matchups.map((matchup) => matchup.summary);
    const averageUnresolved = summaries.reduce((sum, summary) => sum + summary.unresolvedRate, 0) / Math.max(1, summaries.length);
    const averageTurns = summaries.reduce((sum, summary) => sum + summary.turns.average, 0) / Math.max(1, summaries.length);
    const maxFirstPlayerDeviation = Math.max(
        0,
        ...summaries.map((summary) => Math.abs(summary.firstPlayerWinRateResolved - 0.5))
    );

    const reasons = [];
    if (averageUnresolved > (filters.maxAverageUnresolvedRate ?? 0.6)) reasons.push("too_many_unresolved_games");
    if (averageTurns > (filters.maxAverageTurns ?? 180)) reasons.push("games_too_long");
    if (maxFirstPlayerDeviation > (filters.maxFirstPlayerDeviation ?? 0.35)) reasons.push("first_player_imbalance");

    return {
        passed: reasons.length === 0,
        reasons,
        metrics: { averageUnresolved, averageTurns, maxFirstPlayerDeviation }
    };
}
