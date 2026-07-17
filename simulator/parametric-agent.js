import { getLegalMoves } from "./engine.js";
import { randomInteger } from "./random.js";
import { evaluateMoveFeatures } from "./position-evaluation.js";

function chooseRandom(values, random) {
    if (!values.length) return null;
    return values[randomInteger(random, values.length)];
}

export function scoreMove(features, weights, random) {
    const noise = (random() * 2 - 1) * (weights.noise ?? 0);
    return (
        features.winningMove * 100000 +
        features.immediateReward * (weights.attack ?? 0) -
        features.opponentBestReply * (weights.defense ?? 0) +
        features.potentialDelta * (weights.potential ?? 0) +
        features.cascadeDepth * (weights.cascade ?? 0) +
        features.mobility * (weights.mobility ?? 0) +
        features.scoreLead * (weights.tempo ?? 0) +
        features.ejected * (weights.ejection ?? 0) +
        noise
    );
}

export function createParametricAgent(profile) {
    if (!profile?.id || !profile?.weights) throw new Error("Neplatný profil agenta.");
    return {
        id: profile.id,
        name: profile.name ?? profile.id,
        family: profile.family ?? "custom",
        profile,
        chooseMove(state, random) {
            const candidates = getLegalMoves(state).map((move) => ({
                move,
                value: scoreMove(evaluateMoveFeatures(state, move), profile.weights, random)
            }));
            const best = Math.max(...candidates.map((candidate) => candidate.value));
            const epsilon = 1e-9;
            return chooseRandom(candidates.filter((candidate) => Math.abs(candidate.value - best) <= epsilon), random)?.move ?? null;
        }
    };
}
