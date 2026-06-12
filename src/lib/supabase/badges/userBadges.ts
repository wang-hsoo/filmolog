import type { BadgeId } from '../../../components/constants/badge.constants';
import { isBadgeId } from '../../../components/constants/badge.constants';

import { getSupabaseClient } from '../client';

import type { UserBadgeRow } from './types';

type UserBadgeDbRow = {
  user_id: string;
  badge_id: string;
  earned_at: string;
};

export async function fetchUserBadges(userId: string): Promise<UserBadgeRow[]> {
  const { data, error } = await getSupabaseClient()
    .from('user_badges')
    .select('user_id, badge_id, earned_at')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as UserBadgeDbRow[]).flatMap(row => {
    if (!isBadgeId(row.badge_id)) {
      return [];
    }

    return [
      {
        user_id: row.user_id,
        badge_id: row.badge_id as BadgeId,
        earned_at: row.earned_at,
      },
    ];
  });
}
