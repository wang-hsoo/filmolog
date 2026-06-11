import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useState } from 'react';

import {
  BADGES,
  type Badge,
  type BadgeId,
} from '../../components/constants/badge.constants';
import { subscribeToUserBadgeUnlocks } from '../../lib/supabase/badges';

import BadgeUnlockOverlay from './components/BadgeUnlockOverlay';

type BadgeUnlockProviderProps = PropsWithChildren<{
  userId: string | null;
}>;

export function BadgeUnlockProvider({
  userId,
  children,
}: BadgeUnlockProviderProps) {
  const [queue, setQueue] = useState<Badge[]>([]);
  const [currentBadge, setCurrentBadge] = useState<Badge | null>(null);


  const enqueueBadge = useCallback((badgeId: BadgeId) => {
    const badge = BADGES[badgeId];
    setQueue(prev => [...prev, badge]);
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }

    return subscribeToUserBadgeUnlocks(userId, enqueueBadge);
  }, [enqueueBadge, userId]);

  useEffect(() => {
    if (currentBadge || queue.length === 0) {
      return;
    }

    const [nextBadge, ...rest] = queue;
    setCurrentBadge(nextBadge);
    setQueue(rest);
  }, [currentBadge, queue]);

  const handleDismiss = useCallback(() => {
    setCurrentBadge(null);
  }, []);

  return (
    <>
      {children}
      <BadgeUnlockOverlay badge={currentBadge} onDismiss={handleDismiss} />
    </>
  );
}
