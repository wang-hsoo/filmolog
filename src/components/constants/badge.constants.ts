export const BADGE_CATEGORY = {
  activity: 'activity',
  taste: 'taste',
  curation: 'curation',
} as const;

export type BadgeCategory =
  (typeof BADGE_CATEGORY)[keyof typeof BADGE_CATEGORY];

export type BadgeId =
  | 'first_ticket'
  | 'short_film'
  | 'indie_director'
  | 'blockbuster'
  | 'masterpiece'
  | 'popcorn_tears'
  | 'brave_heart'
  | 'couch_critic'
  | 'rotten_collector'
  | 'chief_curator'
  | 'treasure_hunter';

export type Badge = {
  id: BadgeId;
  category: BadgeCategory;
  icon: number;
};

export const BADGES: Record<BadgeId, Badge> = {
  first_ticket: {
    id: 'first_ticket',
    category: BADGE_CATEGORY.activity,
    icon: require('../../../assets/badges/first_ticket.png'),
  },
  short_film: {
    id: 'short_film',
    category: BADGE_CATEGORY.activity,
    icon: require('../../../assets/badges/short_film.png'),
  },
  indie_director: {
    id: 'indie_director',
    category: BADGE_CATEGORY.activity,
    icon: require('../../../assets/badges/indie_director.png'),
  },
  blockbuster: {
    id: 'blockbuster',
    category: BADGE_CATEGORY.activity,
    icon: require('../../../assets/badges/blockbuster.png'),
  },
  masterpiece: {
    id: 'masterpiece',
    category: BADGE_CATEGORY.activity,
    icon: require('../../../assets/badges/masterpiece.png'),
  },
  popcorn_tears: {
    id: 'popcorn_tears',
    category: BADGE_CATEGORY.taste,
    icon: require('../../../assets/badges/popcorn_tears.png'),
  },
  brave_heart: {
    id: 'brave_heart',
    category: BADGE_CATEGORY.taste,
    icon: require('../../../assets/badges/brave_heart.png'),
  },
  couch_critic: {
    id: 'couch_critic',
    category: BADGE_CATEGORY.taste,
    icon: require('../../../assets/badges/couch_critic.png'),
  },
  rotten_collector: {
    id: 'rotten_collector',
    category: BADGE_CATEGORY.taste,
    icon: require('../../../assets/badges/rotten_collector.png'),
  },
  chief_curator: {
    id: 'chief_curator',
    category: BADGE_CATEGORY.curation,
    icon: require('../../../assets/badges/chief_curator.png'),
  },
  treasure_hunter: {
    id: 'treasure_hunter',
    category: BADGE_CATEGORY.curation,
    icon: require('../../../assets/badges/treasure_hunter.png'),
  },
};

/** 카테고리별 표시 순서 */
export const BADGES_BY_CATEGORY: Record<BadgeCategory, BadgeId[]> = {
  activity: [
    'first_ticket',
    'short_film',
    'indie_director',
    'blockbuster',
    'masterpiece',
  ],
  taste: [
    'popcorn_tears',
    'brave_heart',
    'couch_critic',
    'rotten_collector',
  ],
  curation: ['chief_curator', 'treasure_hunter'],
};

export const ALL_BADGE_IDS: BadgeId[] = Object.values(BADGES_BY_CATEGORY).flat();

export function isBadgeId(id: string): id is BadgeId {
  return id in BADGES;
}
