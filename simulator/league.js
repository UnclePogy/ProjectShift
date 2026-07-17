import { createConfig } from "./config.js";
import { createSeededRandom } from "./random.js";
import { playMatch } from "./match.js";
import { summarizeResults } from "./statistics.js";

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

export function runLeague({
    config = {},
    agents,
    gamesPerOrder = 100,
    seed = 12345,
    includeMirrors = true
}) {
    const resolvedConfig = createConfig(config);
    const ratings = Object.fromEntries(agents.map((agent) => [agent.id ?? agent.name, 1500]));
    const matchups = [];

    for (let i = 0; i < agents.length; i++) {
        for (let j = includeMirrors ? i : i + 1; j < agents.length; j++) {
            const pair = [agents[i], agents[j]];
            const orders = i === j ? [[pair[0], pair[1]]] : [[pair[0], pair[1]], [pair[1], pair[0]]];

            for (let orderIndex = 0; orderIndex < orders.length; orderIndex++) {
                const ordered = orders[orderIndex];
                const random = createSeededRandom(seed + i * 100003 + j * 1009 + orderIndex * 97);
                const results = [];
                for (let game = 0; game < gamesPerOrder; game++) {
                    const result = playMatch({ config: resolvedConfig, playerAgents: ordered, random });
                    results.push(result);
                    updateElo(
                        ratings,
                        ordered[0].id ?? ordered[0].name,
                        ordered[1].id ?? ordered[1].name,
                        resultScore(result)
                    );
                }
                matchups.push({
                    player1: ordered[0].id ?? ordered[0].name,
                    player2: ordered[1].id ?? ordered[1].name,
                    games: gamesPerOrder,
                    summary: summarizeResults(results)
                });
            }
        }
    }

    const ranking = Object.entries(ratings)
        .map(([agentId, rating]) => ({ agentId, elo: Math.round(rating) }))
        .sort((a, b) => b.elo - a.elo);

    return { config: resolvedConfig, gamesPerOrder, matchups, ranking };
}
