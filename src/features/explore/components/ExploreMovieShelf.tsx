import { LegendList } from '@legendapp/list/react-native';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import {
  ArchiveEmptyText,
  ArchivePanel,
  ArchiveSectionHeader,
  MovieRowItem,
  getMovieRowItemHeight,
} from '../../../components';
import type { TmdbMovie } from '../../../lib/tmdb/types';
import { theme } from '../../../theme';

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
  emptyMessage = '아직 표시할 작품이 없습니다.',
  hideWhenEmpty = false,
  onPressMovie,
}: ExploreMovieShelfProps) {
  const isInitialLoading = isLoading && movies.length === 0;

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
        <ArchiveEmptyText>목록을 불러오지 못했습니다.</ArchiveEmptyText>
      ) : movies.length === 0 ? (
        <ArchiveEmptyText>{emptyMessage}</ArchiveEmptyText>
      ) : (
        <LegendList
          data={movies}
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <MovieRowItem
              movie={item}
              showRating={showRating}
              onPress={onPressMovie ? () => onPressMovie(item) : undefined}
            />
          )}
          keyExtractor={item => String(item.id)}
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
