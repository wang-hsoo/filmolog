import { LegendList } from '@legendapp/list/react-native';
import { ActivityIndicator } from 'react-native';
import { useMemo } from 'react';
import styled from 'styled-components/native';
import { useTranslation } from 'react-i18next';

import {
  ArchiveEmptyText,
  ArchivePanel,
  ArchiveSectionHeader,
  MoviePosterNativeAd,
  MovieRowItem,
  getMovieRowItemHeight,
} from '../../../components';
import { isMovieEntry, withMovieAdSlots } from '../../../lib/ads';
import type { TmdbMovie } from '../../../lib/tmdb/types';
import { theme } from '../../../theme';

const SHELF_AD_INTERVAL = 6;

type ExploreMovieShelfProps = {
  overline: string;
  title: string;
  subtitle: string;
  movies: TmdbMovie[];
  isLoading: boolean;
  isError: boolean;
  showRating?: boolean;
  emptyMessage?: string;
  hideWhenEmpty?: boolean;
  showNativeAd?: boolean;
  onPressMovie?: (movie: TmdbMovie) => void;
};

function ExploreMovieShelf({
  overline,
  title,
  subtitle,
  movies,
  isLoading,
  isError,
  showRating = false,
  emptyMessage,
  hideWhenEmpty = false,
  showNativeAd = true,
  onPressMovie,
}: ExploreMovieShelfProps) {
  const { t } = useTranslation();
  const resolvedEmptyMessage =
    emptyMessage ?? t('common.archive.noItems');
  const isInitialLoading = isLoading && movies.length === 0;

  const shelfData = useMemo(() => {
    if (!showNativeAd) {
      return movies.map(movie => ({
        kind: 'movie' as const,
        id: String(movie.id),
        movie,
      }));
    }

    return withMovieAdSlots(movies, {
      interval: SHELF_AD_INTERVAL,
      maxAds: 1,
      idPrefix: `${overline}-${title}`,
    });
  }, [movies, overline, showNativeAd, title]);

  if (hideWhenEmpty) {
    if (isInitialLoading || isError || movies.length === 0) {
      return null;
    }
  }

  const shelfHeight = getMovieRowItemHeight(showRating);

  return (
    <ArchivePanel accent compact>
      <ArchiveSectionHeader
        overline={overline}
        title={title}
        subtitle={subtitle}
      />

      {isInitialLoading ? (
        <ListPlaceholder $height={shelfHeight}>
          <ActivityIndicator color={theme.colors.primary} />
        </ListPlaceholder>
      ) : isError ? (
        <ArchiveEmptyText>{t('common.archive.loadListFailed')}</ArchiveEmptyText>
      ) : movies.length === 0 ? (
        <ArchiveEmptyText>{resolvedEmptyMessage}</ArchiveEmptyText>
      ) : (
        <LegendList
          data={shelfData}
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) =>
            isMovieEntry(item) ? (
              <MovieRowItem
                movie={item.movie}
                showRating={showRating}
                onPress={
                  onPressMovie ? () => onPressMovie(item.movie) : undefined
                }
              />
            ) : (
              <MoviePosterNativeAd variant="row" showRating={showRating} />
            )
          }
          keyExtractor={item => item.id}
          estimatedItemSize={122}
          style={{ height: shelfHeight }}
        />
      )}
    </ArchivePanel>
  );
}

export default ExploreMovieShelf;

const ListPlaceholder = styled.View<{ $height: number }>`
  height: ${({ $height }) => $height}px;
  align-items: center;
  justify-content: center;
`;
