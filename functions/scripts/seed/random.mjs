const MODULUS = 2_147_483_648;
const MULTIPLIER = 1_103_515_245;
const INCREMENT = 12_345;

export const createRandom = (initialSeed) => {
  let seed = initialSeed;

  const next = () => {
    seed = (seed * MULTIPLIER + INCREMENT) % MODULUS;
    return seed / MODULUS;
  };

  const int = (min, max) => min + Math.floor(next() * (max - min + 1));

  const chance = (probability) => next() < probability;

  const pick = (items) => items[Math.floor(next() * items.length)];

  const weighted = (entries) => {
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let threshold = next() * total;
    for (const [value, weight] of entries) {
      threshold -= weight;
      if (threshold <= 0) return value;
    }
    return entries[entries.length - 1][0];
  };

  const sample = (items, count) => {
    const pool = [...items];
    const result = [];
    while (pool.length > 0 && result.length < count) {
      result.push(pool.splice(Math.floor(next() * pool.length), 1)[0]);
    }
    return result;
  };

  return { next, int, chance, pick, weighted, sample };
};
