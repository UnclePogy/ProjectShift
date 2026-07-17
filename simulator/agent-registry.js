import { agents as legacyAgents } from "./agents.js";
import { CORE_AGENT_PROFILES, generateAgentPopulation } from "./agent-profiles.js";
import { createParametricAgent } from "./parametric-agent.js";

export function createAgentRegistry({ includePopulation = false, perFamily = 4, customProfiles = [] } = {}) {
    const registry = new Map(Object.entries(legacyAgents));
    const profiles = [...CORE_AGENT_PROFILES, ...customProfiles];
    if (includePopulation) profiles.push(...generateAgentPopulation({ perFamily }));
    for (const profile of profiles) registry.set(profile.id, createParametricAgent(profile));
    return registry;
}

export function getRegisteredAgent(id, options = {}) {
    const agent = createAgentRegistry(options).get(id);
    if (!agent) throw new Error(`Neznámý agent: ${id}`);
    return agent;
}
