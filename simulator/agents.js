import { applyMove, getLegalMoves } from "./engine.js";
import { randomInteger } from "./random.js";

function chooseRandom(values, random) {
    if (values.length === 0) return null;
    return values[randomInteger(random, values.length)];
}

export const agents = {
    random: {
        name: "Random",
        chooseMove(state, random) {
            return chooseRandom(getLegalMoves(state), random);
        }
    },

    greedy: {
        name: "Greedy",
        chooseMove(state, random) {
            const candidates = getLegalMoves(state).map((move) => {
                const previewRandom = () => 0;
                const result = applyMove(state, move, previewRandom);
                return { move, value: result.moveResult.reward };
            });
            const bestValue = Math.max(...candidates.map((candidate) => candidate.value));
            return chooseRandom(candidates.filter((candidate) => candidate.value === bestValue), random)?.move ?? null;
        }
    },

    defensive: {
        name: "Defensive one-ply",
        chooseMove(state, random) {
            const candidates = getLegalMoves(state).map((move) => {
                const ownResult = applyMove(state, move, () => 0);
                if (ownResult.state.endReason) return { move, value: 100000 + ownResult.moveResult.reward };

                const opponentRewards = getLegalMoves(ownResult.state).map((reply) => {
                    return applyMove(ownResult.state, reply, () => 0).moveResult.reward;
                });
                const bestOpponentReward = opponentRewards.length ? Math.max(...opponentRewards) : 0;
                return { move, value: ownResult.moveResult.reward - bestOpponentReward };
            });
            const bestValue = Math.max(...candidates.map((candidate) => candidate.value));
            return chooseRandom(candidates.filter((candidate) => candidate.value === bestValue), random)?.move ?? null;
        }
    }
};

export function getAgent(id) {
    const agent = agents[id];
    if (!agent) throw new Error(`Unknown agent: ${id}`);
    return agent;
}
