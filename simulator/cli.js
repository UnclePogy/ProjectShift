import { runExperiment } from "./experiments.js";

const result = runExperiment({
    games: Number(process.argv[2] ?? 1000),
    seed: Number(process.argv[3] ?? 12345),
    player1: process.argv[4] ?? "random",
    player2: process.argv[5] ?? "random"
});

console.log(JSON.stringify(result, null, 2));
