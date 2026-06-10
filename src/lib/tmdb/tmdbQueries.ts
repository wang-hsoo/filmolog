import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { discoverMoviesByGenres, getGenres, searchMovies } from './tmdb';

export const useGetGenres = () => {
  return useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
  });
};

export const useDiscoverMovies = (genreIds: number[], feedKey: number) => {
  return useQuery({
    queryKey: ['discoverMovies', genreIds, feedKey],
    queryFn: () => discoverMoviesByGenres(genreIds, feedKey),
    enabled: genreIds.length > 0,
    staleTime: 0,
  });
};

/** @deprecated useDiscoverMovies(genreIds, feedKey) 사용 */
export const useGetMovieGenres = (genreIds: number[], feedKey = 0) =>
  useDiscoverMovies(genreIds, feedKey);

export const useSearchMovies = (query: string, page = 1) => {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ['searchMovies', trimmed, page],
    queryFn: () => searchMovies(trimmed, page),
    enabled: trimmed.length >= 2,
    staleTime: 60_000,
  });
};

export const useInfiniteSearchMovies = (query: string) => {
  const trimmed = query.trim();

  return useInfiniteQuery({
    queryKey: ['searchMovies', trimmed],
    queryFn: ({ pageParam }) => searchMovies(trimmed, pageParam),
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: trimmed.length >= 2,
    staleTime: 60_000,
  });
};
