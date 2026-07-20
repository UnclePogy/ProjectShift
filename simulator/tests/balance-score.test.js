import assert from 'node:assert/strict';
import { calculateBalanceScore, normalizeBalanceScoreConfig, rankBalanceResults } from '../balance-score.js';

const normalized = normalizeBalanceScoreConfig({ unresolvedWeight: 5, lengthWeight: 3, fairnessWeight: 2 });
assert.equal(normalized.unresolvedWeight, 0.5);
assert.equal(normalized.lengthWeight, 0.3);
assert.equal(normalized.fairnessWeight, 0.2);

const ideal = calculateBalanceScore({ unresolvedRate: 0, averageTurns: 70, firstPlayerWinRateResolved: 0.5 });
assert.equal(ideal.total, 100);

const weaker = calculateBalanceScore({ unresolvedRate: 0.4, averageTurns: 100, firstPlayerWinRateResolved: 0.65 });
assert.ok(weaker.total < ideal.total);

const ranked = rankBalanceResults([
  { id: 'weaker', metrics: { unresolvedRate: 0.4, averageTurns: 100, firstPlayerWinRateResolved: 0.65 } },
  { id: 'ideal', metrics: { unresolvedRate: 0, averageTurns: 70, firstPlayerWinRateResolved: 0.5 } }
]);
assert.equal(ranked[0].id, 'ideal');

console.log('Balance score tests: OK');
