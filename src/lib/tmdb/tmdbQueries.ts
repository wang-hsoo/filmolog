import { getGenres } from "./tmdb";
import { useQuery } from "@tanstack/react-query";


export const useGetGenres = () => {
    return useQuery({
        queryKey: ['genres'],
        queryFn: getGenres,
    });
}