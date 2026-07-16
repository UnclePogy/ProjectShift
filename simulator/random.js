export function createSeededRandom(seed = Date.now()) {
    let state = Number(seed) >>> 0;

    return function random() {
        state = (state + 0x6D2B79F5) >>> 0;
        let value = state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
}

export function randomInteger(random, maxExclusive) {
    return Math.floor(random() * maxExclusive);
}

export function shuffle(values, random) {
    for (let index = values.length - 1; index > 0; index--) {
        const randomIndex = randomInteger(random, index + 1);
        [values[index], values[randomIndex]] = [values[randomIndex], values[index]];
    }
    return values;
}
