// Simple dice roller with deterministic seed (mulberry32)
export type DiceResult = { formula: string; result: number; rolls: number[] }

function mulberry32(a: number) {
  return function() {
    let t = (a += 0x6D2B79F5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function roll(formula: string, seed?: number): DiceResult {
  const m = formula.match(/^(\d+)d(\d+)([+-]\d+)?$/i)
  if (!m) throw new Error('Invalid dice formula')
  const count = parseInt(m[1], 10)
  const faces = parseInt(m[2], 10)
  const mod = m[3] ? parseInt(m[3], 10) : 0
  const rng = mulberry32((seed ?? Math.floor(Math.random() * 1e9)) | 0)
  const rolls: number[] = []
  for (let i = 0; i < count; i++) {
    rolls.push(1 + Math.floor(rng() * faces))
  }
  const sum = rolls.reduce((a, b) => a + b, 0) + mod
  return { formula, result: sum, rolls }
}
