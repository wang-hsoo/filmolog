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
  name: string;
  description: string;
  category: BadgeCategory;
  icon: number;
};

export const BADGES: Record<BadgeId, Badge> = {
  first_ticket: {
    id: 'first_ticket',
    name: '첫 발권',
    description: '첫 리뷰 작성',
    category: BADGE_CATEGORY.activity,
    icon: require('../../../assets/badges/first_ticket.png'),
  },
  short_film: {
    id: 'short_film',
    name: '단편 필름',
    description: '리뷰 10개 작성',
    category: BADGE_CATEGORY.activity,
    icon: require('../../../assets/badges/short_film.png'),
  },
  indie_director: {
    id: 'indie_director',
    name: '독립 영화 감독',
    description: '리뷰 50개 작성',
    category: BADGE_CATEGORY.activity,
    icon: require('../../../assets/badges/indie_director.png'),
  },
  blockbuster: {
    id: 'blockbuster',
    name: '블록버스터',
    description: '리뷰 100개 작성',
    category: BADGE_CATEGORY.activity,
    icon: require('../../../assets/badges/blockbuster.png'),
  },
  masterpiece: {
    id: 'masterpiece',
    name: '마스터피스',
    description: '리뷰 500개 작성',
    category: BADGE_CATEGORY.activity,
    icon: require('../../../assets/badges/masterpiece.png'),
  },
  popcorn_tears: {
    id: 'popcorn_tears',
    name: '눈물의 팝콘',
    description: '로맨스·드라마 영화 리뷰 20개 작성',
    category: BADGE_CATEGORY.taste,
    icon: require('../../../assets/badges/popcorn_tears.png'),
  },
  brave_heart: {
    id: 'brave_heart',
    name: '강심장',
    description: '공포·스릴러 영화 리뷰 20개 작성',
    category: BADGE_CATEGORY.taste,
    icon: require('../../../assets/badges/brave_heart.png'),
  },
  couch_critic: {
    id: 'couch_critic',
    name: '방구석 평론가',
    description: '50편 이상 평균 평점 2.5 이하 유지',
    category: BADGE_CATEGORY.taste,
    icon: require('../../../assets/badges/couch_critic.png'),
  },
  rotten_collector: {
    id: 'rotten_collector',
    name: '로튼 토마토 수집가',
    description: '다른 사람 평점 2.0 이하 영화에 4.0 이상 평점 3회',
    category: BADGE_CATEGORY.taste,
    icon: require('../../../assets/badges/rotten_collector.png'),
  },
  chief_curator: {
    id: 'chief_curator',
    name: '수석 큐레이터',
    description: '영화 10편 이상 담은 컬렉션 3개 생성',
    category: BADGE_CATEGORY.curation,
    icon: require('../../../assets/badges/chief_curator.png'),
  },
  treasure_hunter: {
    id: 'treasure_hunter',
    name: '보물 사냥꾼',
    description: '위시리스트에 담았던 영화 리뷰 10개 작성',
    category: BADGE_CATEGORY.curation,
    icon: require('../../../assets/badges/treasure_hunter.png'),
  },
};

export const BADGE_CATEGORY_LABELS: Record<BadgeCategory, string> = {
  activity: '활동량',
  taste: '취향 · 장르',
  curation: '큐레이션',
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
