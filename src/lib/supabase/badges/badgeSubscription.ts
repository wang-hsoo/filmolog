import { isBadgeId } from '../../../components/constants/badge.constants';
import type { BadgeId } from '../../../components/constants/badge.constants';
import { getSupabaseClient } from '../client';

export function subscribeToUserBadgeUnlocks(
  userId: string,
  onUnlock: (badgeId: BadgeId) => void,
) {
  const supabase = getSupabaseClient();

  const channel = supabase
    .channel(`user-badges:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'user_badges',
        filter: `user_id=eq.${userId}`,
      },
      payload => {
        const badgeId = payload.new?.badge_id;

        if (typeof badgeId === 'string' && isBadgeId(badgeId)) {
          onUnlock(badgeId);
        }
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
