import type { Effects as EffectsType } from '@/schemas/turn';

export type Effects = EffectsType | undefined;

export function mergeEffects(a?: Effects, b?: Effects): Effects {
  const hasA = a && (a.party?.length || a.inventory?.length || a.quests?.length);
  const hasB = b && (b.party?.length || b.inventory?.length || b.quests?.length);
  if (!hasA && !hasB) return undefined;
  return {
    party: [...(a?.party || []), ...(b?.party || [])],
    inventory: [...(a?.inventory || []), ...(b?.inventory || [])],
    quests: [...(a?.quests || []), ...(b?.quests || [])],
  };
}
