import { useQuery } from '@tanstack/react-query';

import { fetchUserBadges } from './userBadges';

export const badgeKeys = {
  all: ['badges'] as const,
  user: (userId: string) => [...badgeKeys.all, 'user', userId] as const,
};

export function useGetUserBadges(userId: string) {
  return useQuery({
    queryKey: badgeKeys.user(userId),
    queryFn: () => fetchUserBadges(userId),
    enabled: !!userId,
  });
}
