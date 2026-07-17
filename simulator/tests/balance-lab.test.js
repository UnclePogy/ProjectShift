import assert from "node:assert/strict";
import { createSeededRandom } from "../random.js";
import { createInitialState } from "../engine.js";
import { createParametricAgent } from "../parametric-agent.js";
import { CORE_AGENT_PROFILES, generateAgentPopulation } from "../agent-profiles.js";
import { buildExperimentMatrix, applyScreeningFilters } from "../experiment-matrix.js";
import { runLeague } from "../league.js";

const population = generateAgentPopulation({ perFamily: 4 });
assert.equal(population.length, 20);
assert.equal(new Set(population.map((profile) => profile.id)).size, 20);

const matrix = buildExperimentMatrix({
    boardSizes: [5],
    symbolCounts: [7, 8, 9],
    queueSizes: [2],
    sharedQueueModes: [false, true],
    bottomInsertionModes: [false]
});
assert.equal(matrix.length, 6);

const agentA = createParametricAgent(CORE_AGENT_PROFILES[0]);
const agentB = createParametricAgent(CORE_AGENT_PROFILES[3]);
const state = createInitialState({ symbolCount: 8 }, createSeededRandom(1));
assert.ok(agentA.chooseMove(state, createSeededRandom(2)));

const league = runLeague({
    config: { symbolCount: 8, maxTurns: 20, noScoreTurnLimit: 10 },
    agents: [agentA, agentB],
    gamesPerOrder: 2,
    seed: 7,
    includeMirrors: false
});
assert.equal(league.matchups.length, 2);
assert.equal(league.ranking.length, 2);

console.log("Balance Lab tests: OK");

const syntheticLeague = {
    matchups: [
        { summary: { games: 2, resolvedGames: 2, unresolvedRate: 0, winnerCounts: { player1: 2, player2: 0, unresolved: 0 }, turns: { average: 50 } } },
        { summary: { games: 2, resolvedGames: 2, unresolvedRate: 0, winnerCounts: { player1: 0, player2: 2, unresolved: 0 }, turns: { average: 70 } } }
    ]
};
const screening = applyScreeningFilters(syntheticLeague, { maxFirstPlayerDeviation: 0.25 });
assert.equal(screening.passed, true);
assert.equal(screening.metrics.firstPlayerWinRateResolved, 0.5);
