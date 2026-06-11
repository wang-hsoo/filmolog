/** GET /genre/movie/list — 단일 장르 */
export type TmdbGenre = {
  id: number;
  name: string;
};

/** GET /genre/movie/list — 응답 */
export type TmdbGenreListResponse = {
  genres: TmdbGenre[];
};

/** GET /discover/movie — results 항목 */
export type TmdbMovie = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  original_language: string;
};

/** GET /discover/movie — 응답 */
export type TmdbDiscoverMovieResponse = {
  page: number;
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
};

/** GET /search/movie — 응답 */
export type TmdbSearchMovieResponse = {
  page: number;
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
};

export type TmdbCastMember = {
  id: number;
  name: string;
  character: string;
  order: number;
};

export type TmdbCrewMember = {
  id: number;
  name: string;
  job: string;
  department: string;
};

export type TmdbMovieCredits = {
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
};

/** GET /movie/{id}?append_to_response=credits */
export type TmdbMovieDetail = {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  release_date: string;
  runtime: number | null;
  genres: TmdbGenre[];
  credits: TmdbMovieCredits;
};
