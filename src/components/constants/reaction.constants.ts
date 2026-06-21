export const REACTION_KEYS = [
  'masterpiece',
  'keeper',
  'immersive',
  'catharsis',
  'afterglow',
  'disappointed',
] as const;

export type ReactionKey = (typeof REACTION_KEYS)[number];

export const MAX_REACTION_SELECTIONS = 2;

export const REACTION_ICONS: Record<ReactionKey, string> = {
  masterpiece: 'star-shooting-outline',
  keeper: 'archive-star-outline',
  immersive: 'clock-fast',
  catharsis: 'lightning-bolt-outline',
  afterglow: 'moon-waning-crescent',
  disappointed: 'thumb-down-outline',
};

export function isReactionKey(value: string | null | undefined): value is ReactionKey {
  return (
    typeof value === 'string' &&
    (REACTION_KEYS as readonly string[]).includes(value)
  );
}

export function normalizeReactionKeys(
  keys: readonly ReactionKey[] | null | undefined,
): ReactionKey[] {
  if (!keys?.length) {
    return [];
  }

  const unique: ReactionKey[] = [];

  for (const key of keys) {
    if (!isReactionKey(key) || unique.includes(key)) {
      continue;
    }

    unique.push(key);

    if (unique.length >= MAX_REACTION_SELECTIONS) {
      break;
    }
  }

  return unique;
}

export function parseReactionKeysFromRow(
  reactionKeys: unknown,
  legacyReactionKey?: string | null,
): ReactionKey[] {
  if (Array.isArray(reactionKeys)) {
    return normalizeReactionKeys(
      reactionKeys.filter((key): key is ReactionKey => isReactionKey(key)),
    );
  }

  if (isReactionKey(legacyReactionKey)) {
    return [legacyReactionKey];
  }

  return [];
}

export function emptyReactionCounts(): Record<ReactionKey, number> {
  return {
    masterpiece: 0,
    keeper: 0,
    immersive: 0,
    catharsis: 0,
    afterglow: 0,
    disappointed: 0,
  };
}

export function toggleReactionKey(
  selected: readonly ReactionKey[],
  key: ReactionKey,
): ReactionKey[] {
  if (selected.includes(key)) {
    return selected.filter(item => item !== key);
  }

  if (selected.length >= MAX_REACTION_SELECTIONS) {
    return [...selected];
  }

  return [...selected, key];
}
