import { useQuery } from "@tanstack/react-query";
import { getGenres } from "./tmdb";


export const useGetGenres = () => {
    return useQuery({
        queryKey: ['genres'],
        queryFn: getGenres,
    });
}