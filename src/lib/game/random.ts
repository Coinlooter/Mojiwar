export function createSeededRandom(seed: string) {
  let state = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index);
    state = Math.imul(state, 16777619);
  }

  return function nextRandom() {
    state += 0x6d2b79f5;
    let result = state;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);

    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickWeighted<T>(
  items: Array<{ item: T; weight: number }>,
  random: () => number,
): T {
  const totalWeight = items.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = random() * totalWeight;

  for (const entry of items) {
    roll -= entry.weight;

    if (roll <= 0) {
      return entry.item;
    }
  }

  return items[items.length - 1].item;
}
