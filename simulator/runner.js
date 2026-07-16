import { runExperiment, compareSymbolCounts } from "./experiments.js";

const form = document.querySelector("#simulation-form");
const output = document.querySelector("#output");
const runButton = document.querySelector("#run-button");
const compareButton = document.querySelector("#compare-button");

function readOptions() {
    const data = new FormData(form);
    return {
        games: Number(data.get("games")),
        seed: Number(data.get("seed")),
        player1: data.get("player1"),
        player2: data.get("player2"),
        config: {
            boardSize: Number(data.get("boardSize")),
            symbolCount: Number(data.get("symbolCount")),
            queueSize: Number(data.get("queueSize")),
            startingScore: Number(data.get("startingScore")),
            sharedQueueEnabled: data.get("sharedQueueEnabled") === "on",
            topInsertionEnabled: data.get("topInsertionEnabled") === "on",
            bottomInsertionEnabled: data.get("bottomInsertionEnabled") === "on",
            maxTurns: Number(data.get("maxTurns")),
            noScoreTurnLimit: Number(data.get("noScoreTurnLimit")),
            repetitionLimit: 3
        }
    };
}

function render(value) {
    output.textContent = JSON.stringify(value, null, 2);
}

function runSafely(callback) {
    output.textContent = "Probíhá výpočet…";
    requestAnimationFrame(() => {
        try {
            render(callback());
        } catch (error) {
            output.textContent = `CHYBA: ${error.message}\n${error.stack ?? ""}`;
        }
    });
}

runButton.addEventListener("click", () => runSafely(() => runExperiment(readOptions())));
compareButton.addEventListener("click", () => runSafely(() => compareSymbolCounts({
    ...readOptions(),
    symbolCounts: [6, 7, 8, 9, 10, 11, 12]
})));
