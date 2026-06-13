import { i18n } from '../../i18n';
import {
  formatRuntimeLocalized,
  formatWatchedDateWithWeekdayLocalized,
} from '../../i18n/labels';

import type { TmdbMovieDetail } from './types';

export function getReleaseYear(releaseDate: string) {
  const year = releaseDate?.slice(0, 4);
  return year || null;
}

export function getDirectors(detail: TmdbMovieDetail) {
  const directors = detail.credits.crew
    .filter(member => member.job === 'Director')
    .map(member => member.name);

  return directors.length > 0 ? directors.join(', ') : null;
}

export function getCast(detail: TmdbMovieDetail, limit = 4) {
  const cast = [...detail.credits.cast]
    .sort((a, b) => a.order - b.order)
    .slice(0, limit)
    .map(member => member.name);

  return cast.length > 0 ? cast.join(', ') : null;
}

export function formatRuntime(minutes: number | null | undefined) {
  return formatRuntimeLocalized(i18n.t.bind(i18n), minutes);
}

export function getGenres(detail: TmdbMovieDetail) {
  return detail.genres.length > 0
    ? detail.genres.map(genre => genre.name).join(', ')
    : null;
}

export function formatReleaseDate(value: string) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split('-');
  if (!year) {
    return null;
  }

  if (month && day) {
    return `${year}.${month}.${day}`;
  }

  return year;
}

export function formatWatchedDateWithWeekday(dateStr: string | null) {
  return formatWatchedDateWithWeekdayLocalized(i18n.t.bind(i18n), dateStr);
}
