/** GET /genre/movie/list — 단일 장르 */
export type TmdbGenre = {
  id: number;
  name: string;
};

/** GET /genre/movie/list — 응답 */
export type TmdbGenreListResponse = {
  genres: TmdbGenre[];
};
