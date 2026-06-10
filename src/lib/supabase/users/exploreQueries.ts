import { useQuery } from "@tanstack/react-query";
import { getUserFavoriteGenres } from "./explore";


export const useGetUserFavoriteGenres = (userId: string) => {
    return useQuery({
        queryKey: ['userFavoriteGenres', userId],
        queryFn: () => getUserFavoriteGenres(userId),
        enabled: !!userId,
    });
}