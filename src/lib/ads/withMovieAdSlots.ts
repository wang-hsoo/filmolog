import type { TmdbMovie } from '../tmdb/types';

export type AdSlotOptions = {
  /** 몇 번째 항목마다 광고 슬롯을 넣을지 */
  interval?: number;
  /** 목록당 최대 광고 수 */
  maxAds?: number;
  /** 광고 슬롯 key prefix */
  idPrefix?: string;
};

export type ListAdEntry<T> =
  | { kind: 'item'; id: string; item: T }
  | { kind: 'ad'; id: string };

export type MovieListEntry =
  | { kind: 'movie'; id: string; movie: TmdbMovie }
  | { kind: 'ad'; id: string };

export function isListItemEntry<T>(
  entry: ListAdEntry<T>,
): entry is Extract<ListAdEntry<T>, { kind: 'item' }> {
  return entry.kind === 'item';
}

export function isMovieEntry(
  entry: MovieListEntry,
): entry is Extract<MovieListEntry, { kind: 'movie' }> {
  return entry.kind === 'movie';
}

export function withAdSlots<T>(
  items: T[],
  getId: (item: T) => string,
  {
    interval = 6,
    maxAds = 1,
    idPrefix = 'list',
  }: AdSlotOptions = {},
): ListAdEntry<T>[] {
  if (items.length < interval || maxAds <= 0) {
    return items.map(item => ({
      kind: 'item',
      id: getId(item),
      item,
    }));
  }

  const entries: ListAdEntry<T>[] = [];
  let adCount = 0;

  items.forEach((item, index) => {
    entries.push({
      kind: 'item',
      id: getId(item),
      item,
    });

    const itemNumber = index + 1;
    if (
      adCount < maxAds &&
      itemNumber % interval === 0 &&
      itemNumber < items.length
    ) {
      adCount += 1;
      entries.push({
        kind: 'ad',
        id: `${idPrefix}-ad-${adCount}`,
      });
    }
  });

  return entries;
}

export function withMovieAdSlots(
  movies: TmdbMovie[],
  options: AdSlotOptions = {},
): MovieListEntry[] {
  return withAdSlots(movies, movie => String(movie.id), options).map(entry =>
    entry.kind === 'item'
      ? { kind: 'movie', id: entry.id, movie: entry.item }
      : entry,
  );
}
