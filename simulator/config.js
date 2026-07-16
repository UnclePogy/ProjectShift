export const DEFAULT_SIMULATION_CONFIG = Object.freeze({
    boardSize: 5,
    symbolCount: 10,
    queueSize: 2,
    startingScore: 7,
    sharedQueueEnabled: false,
    topInsertionEnabled: true,
    bottomInsertionEnabled: false,
    maxTurns: 200,
    noScoreTurnLimit: 50,
    repetitionLimit: 3
});

export function createConfig(overrides = {}) {
    const config = { ...DEFAULT_SIMULATION_CONFIG, ...overrides };

    if (!Number.isInteger(config.boardSize) || config.boardSize < 3) {
        throw new Error("boardSize musí být celé číslo alespoň 3.");
    }
    if (!Number.isInteger(config.symbolCount) || config.symbolCount < 3) {
        throw new Error("symbolCount musí být celé číslo alespoň 3.");
    }
    if (!Number.isInteger(config.queueSize) || config.queueSize < 1) {
        throw new Error("queueSize musí být celé číslo alespoň 1.");
    }
    if (!Number.isInteger(config.startingScore) || config.startingScore < 1) {
        throw new Error("startingScore musí být celé číslo alespoň 1.");
    }

    return Object.freeze(config);
}
