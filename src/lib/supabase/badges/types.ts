import type { BadgeId } from '../../../components/constants/badge.constants';

export type UserBadgeRow = {
  user_id: string;
  badge_id: BadgeId;
  earned_at: string;
};
