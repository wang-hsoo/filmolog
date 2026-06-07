import ApiClient from '../api/client';

import type { TmdbGenreListResponse } from './types';

const client = new ApiClient({
  type: 'movie',
});

export const getGenres = async (): Promise<TmdbGenreListResponse> => {
  const response = await client.instance.get<TmdbGenreListResponse>(
    '/genre/movie/list',
    { params: { language: 'ko-KR' } },
  );
  return response.data;
};

export type { TmdbGenre, TmdbGenreListResponse } from './types';
