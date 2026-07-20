export const DEFAULT_BALANCE_SCORE_CONFIG = Object.freeze({
  unresolvedWeight: 0.5,
  lengthWeight: 0.3,
  fairnessWeight: 0.2,
  targetTurns: 70,
  pointsLostPerTurn: 1
});

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeBalanceScoreConfig(config = {}) {
  const merged = { ...DEFAULT_BALANCE_SCORE_CONFIG, ...config };
  const rawWeights = [merged.unresolvedWeight, merged.lengthWeight, merged.fairnessWeight]
    .map((value) => Math.max(0, Number(value) || 0));
  const totalWeight = rawWeights.reduce((sum, value) => sum + value, 0) || 1;

  return {
    unresolvedWeight: rawWeights[0] / totalWeight,
    lengthWeight: rawWeights[1] / totalWeight,
    fairnessWeight: rawWeights[2] / totalWeight,
    targetTurns: Math.max(1, Number(merged.targetTurns) || DEFAULT_BALANCE_SCORE_CONFIG.targetTurns),
    pointsLostPerTurn: Math.max(0, Number(merged.pointsLostPerTurn) || DEFAULT_BALANCE_SCORE_CONFIG.pointsLostPerTurn)
  };
}

export function calculateBalanceScore(metrics, config = {}) {
  const normalized = normalizeBalanceScoreConfig(config);
  const unresolvedRate = clamp(Number(metrics.unresolvedRate) || 0, 0, 1);
  const averageTurns = Math.max(0, Number(metrics.averageTurns) || 0);
  const firstPlayerWinRate = metrics.firstPlayerWinRateResolved;

  const unresolvedScore = clamp((1 - unresolvedRate) * 100);
  const lengthScore = clamp(100 - Math.abs(averageTurns - normalized.targetTurns) * normalized.pointsLostPerTurn);
  const fairnessScore = firstPlayerWinRate === null || firstPlayerWinRate === undefined
    ? 0
    : clamp(100 - Math.abs(Number(firstPlayerWinRate) - 0.5) * 200);

  const total = unresolvedScore * normalized.unresolvedWeight
    + lengthScore * normalized.lengthWeight
    + fairnessScore * normalized.fairnessWeight;

  return {
    total: clamp(total),
    unresolvedScore,
    lengthScore,
    fairnessScore,
    config: normalized
  };
}

export function rankBalanceResults(entries, config = {}) {
  return entries
    .map((entry) => ({
      ...entry,
      balanceScore: calculateBalanceScore(entry.metrics, config)
    }))
    .sort((a, b) => b.balanceScore.total - a.balanceScore.total);
}
