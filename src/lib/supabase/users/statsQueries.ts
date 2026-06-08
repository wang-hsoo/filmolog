import { getUserStats } from "./stats";
import { useQuery } from "@tanstack/react-query";

export const useGetUserStats = (userId: string) => {
    return useQuery({
        queryKey: ['userStats', userId],
        queryFn: () => getUserStats(userId),
    });
}