import fs from "node:fs";
import path from "node:path";
import { buildExperimentMatrix, applyScreeningFilters } from "./experiment-matrix.js";
import { createAgentRegistry } from "./agent-registry.js";
import { runLeague } from "./league.js";

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

export function runBatchFromSpec(specPath) {
    const spec = readJson(specPath);
    const registry = createAgentRegistry({
        includePopulation: spec.agentSet === "population20",
        perFamily: spec.perFamily ?? 4
    });
    const selectedAgents = spec.agentIds.map((id) => {
        const agent = registry.get(id);
        if (!agent) throw new Error(`Agent ${id} není v registru.`);
        return agent;
    });

    const matrix = buildExperimentMatrix(spec.matrix);
    const outputDir = path.resolve(spec.outputDir ?? "../simulation-results/balance-lab");
    const completed = [];

    for (const item of matrix) {
        const resultPath = path.join(outputDir, "runs", `${item.id}.json`);
        if (spec.resume !== false && fs.existsSync(resultPath)) {
            completed.push(readJson(resultPath));
            continue;
        }

        const league = runLeague({
            config: item.config,
            agents: selectedAgents,
            gamesPerOrder: spec.gamesPerOrder ?? 100,
            seed: (spec.seed ?? 12345) + completed.length * 7919,
            includeMirrors: spec.includeMirrors !== false
        });
        const screening = applyScreeningFilters(league, spec.filters);
        const record = { id: item.id, config: item.config, screening, league };
        writeJson(resultPath, record);
        completed.push(record);
    }

    const summary = completed.map((record) => ({
        id: record.id,
        config: record.config,
        passed: record.screening.passed,
        reasons: record.screening.reasons,
        metrics: record.screening.metrics,
        ranking: record.league.ranking
    }));
    writeJson(path.join(outputDir, "summary.json"), summary);
    return summary;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
    const specPath = process.argv[2] ?? "./configs/screening.json";
    const summary = runBatchFromSpec(specPath);
    console.log(JSON.stringify(summary, null, 2));
}
