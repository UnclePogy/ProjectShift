import { createConfig } from './config.js';
import { createSeededRandom } from './random.js';
import { playMatch } from './match.js';
import { summarizeResults } from './statistics.js';
import { createAgentRegistry } from './agent-registry.js';
import { buildExperimentMatrix, applyScreeningFilters } from './experiment-matrix.js';

let paused = false;
let stopped = false;

self.onmessage = async (event) => {
  const message = event.data;
  if (message.type === 'pause') paused = true;
  if (message.type === 'resume') paused = false;
  if (message.type === 'stop') stopped = true;
  if (message.type === 'start') {
    paused = false;
    stopped = false;
    try {
      await runLab(message.payload);
    } catch (error) {
      self.postMessage({ type: 'error', message: error?.stack || error?.message || String(error) });
    }
  }
};

function sleep(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitIfPaused() {
  while (paused && !stopped) await sleep(100);
}

function expectedScore(ratingA, ratingB) {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
}

function updateElo(ratings, idA, idB, scoreA, k = 24) {
  const ratingA = ratings[idA] ?? 1500;
  const ratingB = ratings[idB] ?? 1500;
  const expectedA = expectedScore(ratingA, ratingB);
  ratings[idA] = ratingA + k * (scoreA - expectedA);
  ratings[idB] = ratingB + k * ((1 - scoreA) - (1 - expectedA));
}

function resultScore(match) {
  if (match.winner === 0) return 1;
  if (match.winner === 1) return 0;
  return 0.5;
}

function buildOrders(agents, includeMirrors) {
  const orders = [];
  for (let i = 0; i < agents.length; i++) {
    for (let j = includeMirrors ? i : i + 1; j < agents.length; j++) {
      if (i === j) orders.push([agents[i], agents[j]]);
      else {
        orders.push([agents[i], agents[j]]);
        orders.push([agents[j], agents[i]]);
      }
    }
  }
  return orders;
}

async function runLab(payload) {
  const matrix = buildExperimentMatrix(payload.matrix);
  const registry = createAgentRegistry({ includePopulation: payload.agentSet === 'population20', perFamily: payload.perFamily ?? 4 });
  const agents = payload.agentIds.map((id) => {
    const agent = registry.get(id);
    if (!agent) throw new Error(`Neznámý agent: ${id}`);
    return agent;
  });
  const orders = buildOrders(agents, payload.includeMirrors);
  const totalGames = matrix.length * orders.length * payload.gamesPerOrder;
  let completedGames = 0;
  const allResults = [];

  self.postMessage({ type: 'started', totals: { configurations: matrix.length, matchupOrders: orders.length, games: totalGames } });

  for (let configIndex = 0; configIndex < matrix.length; configIndex++) {
    if (stopped) break;
    const matrixEntry = matrix[configIndex];
    const config = createConfig(matrixEntry.config);
    const ratings = Object.fromEntries(agents.map((agent) => [agent.id ?? agent.name, 1500]));
    const matchups = [];

    for (let orderIndex = 0; orderIndex < orders.length; orderIndex++) {
      if (stopped) break;
      const ordered = orders[orderIndex];
      const random = createSeededRandom(payload.seed + configIndex * 1000003 + orderIndex * 1009);
      const results = [];

      for (let game = 0; game < payload.gamesPerOrder; game++) {
        await waitIfPaused();
        if (stopped) break;
        const result = playMatch({ config, playerAgents: ordered, random });
        results.push(result);
        updateElo(ratings, ordered[0].id ?? ordered[0].name, ordered[1].id ?? ordered[1].name, resultScore(result));
        completedGames++;
        if (completedGames % 5 === 0 || completedGames === totalGames) {
          self.postMessage({
            type: 'progress',
            completedGames,
            totalGames,
            configIndex: configIndex + 1,
            totalConfigurations: matrix.length,
            currentMatchup: `${ordered[0].name} vs ${ordered[1].name}`
          });
          await sleep(0);
        }
      }

      if (results.length) {
        matchups.push({
          player1: ordered[0].id ?? ordered[0].name,
          player2: ordered[1].id ?? ordered[1].name,
          games: results.length,
          summary: summarizeResults(results)
        });
      }
    }

    const ranking = Object.entries(ratings)
      .map(([agentId, rating]) => ({ agentId, elo: Math.round(rating) }))
      .sort((a, b) => b.elo - a.elo);
    const leagueResult = { id: matrixEntry.id, config, gamesPerOrder: payload.gamesPerOrder, matchups, ranking };
    const screening = applyScreeningFilters(leagueResult, payload.filters ?? {});
    const result = { ...leagueResult, screening };
    allResults.push(result);
    self.postMessage({ type: 'configurationComplete', result, completedConfigurations: configIndex + 1, totalConfigurations: matrix.length });
  }

  self.postMessage({ type: stopped ? 'stopped' : 'complete', results: allResults, completedGames, totalGames });
}
