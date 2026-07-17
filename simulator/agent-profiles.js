export const CORE_AGENT_PROFILES = Object.freeze([
    {
        id: "aggressive",
        name: "Aggressive",
        family: "aggressive",
        weights: { attack: 4, defense: 0.4, potential: 0.2, cascade: 0.5, mobility: 0, tempo: 0.3, ejection: -0.1, noise: 0.02 }
    },
    {
        id: "blocker",
        name: "Blocker",
        family: "defensive",
        weights: { attack: 1.2, defense: 3.2, potential: 0.2, cascade: 0.2, mobility: -0.02, tempo: 0.1, ejection: -0.1, noise: 0.02 }
    },
    {
        id: "builder",
        name: "Builder",
        family: "builder",
        weights: { attack: 1.1, defense: 0.6, potential: 2.2, cascade: 1.2, mobility: 0, tempo: 0, ejection: -0.15, noise: 0.03 }
    },
    {
        id: "balanced",
        name: "Balanced",
        family: "balanced",
        weights: { attack: 2.4, defense: 1.8, potential: 0.9, cascade: 0.7, mobility: -0.01, tempo: 0.2, ejection: -0.1, noise: 0.02 }
    },
    {
        id: "opportunist",
        name: "Opportunist",
        family: "aggressive",
        weights: { attack: 3, defense: 1, potential: 0.4, cascade: 1.5, mobility: 0, tempo: 0.4, ejection: 0, noise: 0.15 }
    },
    {
        id: "human-like",
        name: "Human-like",
        family: "human",
        weights: { attack: 2, defense: 1.2, potential: 0.7, cascade: 0.6, mobility: 0, tempo: 0.15, ejection: -0.05, noise: 0.35 }
    }
]);

const FAMILY_BASES = {
    aggressive: { attack: 3.4, defense: 0.8, potential: 0.5, cascade: 0.8, mobility: 0, tempo: 0.3, ejection: -0.1, noise: 0.05 },
    defensive: { attack: 1.5, defense: 2.8, potential: 0.5, cascade: 0.4, mobility: -0.01, tempo: 0.1, ejection: -0.1, noise: 0.05 },
    builder: { attack: 1.4, defense: 0.8, potential: 2, cascade: 1.1, mobility: 0, tempo: 0, ejection: -0.15, noise: 0.05 },
    balanced: { attack: 2.3, defense: 1.7, potential: 1, cascade: 0.7, mobility: 0, tempo: 0.2, ejection: -0.1, noise: 0.05 },
    human: { attack: 2, defense: 1.3, potential: 0.8, cascade: 0.7, mobility: 0, tempo: 0.15, ejection: -0.05, noise: 0.3 }
};

export function generateAgentPopulation({ perFamily = 4 } = {}) {
    const profiles = [];
    for (const [family, base] of Object.entries(FAMILY_BASES)) {
        for (let index = 0; index < perFamily; index++) {
            const offset = index - (perFamily - 1) / 2;
            profiles.push({
                id: `${family}-${String(index + 1).padStart(2, "0")}`,
                name: `${family[0].toUpperCase()}${family.slice(1)} ${index + 1}`,
                family,
                weights: {
                    ...base,
                    attack: Math.max(0, base.attack + offset * 0.22),
                    defense: Math.max(0, base.defense - offset * 0.16),
                    potential: Math.max(0, base.potential + offset * 0.12),
                    noise: Math.max(0, base.noise + Math.abs(offset) * 0.015)
                }
            });
        }
    }
    return profiles;
}
