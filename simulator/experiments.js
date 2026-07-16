import { createConfig } from "./config.js";
import { getAgent } from "./agents.js";
import { playMatch } from "./match.js";
import { createSeededRandom } from "./random.js";
import { summarizeResults } from "./statistics.js";

export function runExperiment({
    games = 1000,
    seed = 12345,
    config = {},
    player1 = "random",
    player2 = "random"
} = {}) {
    const resolvedConfig = createConfig(config);
    const random = createSeededRandom(seed);
    const playerAgents = [getAgent(player1), getAgent(player2)];
    const results = [];

    for (let game = 0; game < games; game++) {
        results.push(playMatch({ config: resolvedConfig, playerAgents, random }));
    }

    return {
        experiment: {
            games,
            seed,
            config: resolvedConfig,
            players: playerAgents.map((agent) => agent.name)
        },
        summary: summarizeResults(results)
    };
}

export function compareSymbolCounts({ symbolCounts, ...baseOptions }) {
    return symbolCounts.map((symbolCount) => runExperiment({
        ...baseOptions,
        config: { ...(baseOptions.config ?? {}), symbolCount }
    }));
}
