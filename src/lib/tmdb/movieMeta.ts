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
  if (!minutes || minutes <= 0) {
    return null;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}분`;
  }

  if (mins === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${mins}분`;
}

export function formatWatchedDateWithWeekday(dateStr: string | null) {
  if (!dateStr) {
    return null;
  }

  const [year, month, day] = dateStr.split('-').map(Number);

  if (!year || !month || !day) {
    return dateStr.replace(/-/g, '.');
  }

  const date = new Date(year, month - 1, day);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  return `${String(year).padStart(4, '0')}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')} (${weekdays[date.getDay()]})`;
}
