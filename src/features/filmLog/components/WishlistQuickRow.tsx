import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import {
  ArchiveEmptyText,
  ArchivePanel,
  ArchiveSectionHeader,
} from '../../../components';
import type { UserWishlistMovie } from '../../../lib/supabase/wishlist';
import { getTmdbPosterUrl } from '../../../lib/tmdb/images';
import type { TmdbMovie } from '../../../lib/tmdb/types';
import { theme } from '../../../theme';

const CIRCLE_SIZE = 52;
const QUICK_LIMIT = 10;

export function toTmdbMovieFromWishlist(item: UserWishlistMovie): TmdbMovie {
  return {
    id: item.tmdbId,
    title: item.title,
    original_title: item.title,
    overview: '',
    poster_path: item.posterPath,
    backdrop_path: null,
    release_date: '',
    vote_average: 0,
    vote_count: 0,
    popularity: 0,
    genre_ids: [],
    original_language: '',
  };
}

type WishlistQuickRowProps = {
  items: UserWishlistMovie[];
  isLoading: boolean;
  isError: boolean;
  onSelectMovie: (movie: TmdbMovie) => void;
};

function WishlistQuickRow({
  items,
  isLoading,
  isError,
  onSelectMovie,
}: WishlistQuickRowProps) {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const visibleItems = items.slice(0, QUICK_LIMIT);
  const hasMore = items.length > QUICK_LIMIT;

  if (!isLoading && !isError && items.length === 0) {
    return null;
  }

  return (
    <ArchivePanel accent compact>
      <ArchiveSectionHeader
        overline="WISHLIST"
        title={t('filmLog.wishlist.title')}
        subtitle={t('filmLog.wishlist.subtitle')}
      />

      {isLoading ? (
        <LoaderWrap>
          <ActivityIndicator color={theme.colors.primary} size="small" />
        </LoaderWrap>
      ) : isError ? (
        <ArchiveEmptyText>{t('filmLog.wishlist.loadFailed')}</ArchiveEmptyText>
      ) : (
        <>
          <ChipScroll
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}>
            {visibleItems.map(item => (
              <ChipButton
                key={item.tmdbId}
                onPress={() => onSelectMovie(toTmdbMovieFromWishlist(item))}
                accessibilityRole="button"
                accessibilityLabel={item.title}>
                {item.posterPath ? (
                  <ChipPoster
                    source={{ uri: getTmdbPosterUrl(item.posterPath) }}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                ) : (
                  <ChipPlaceholder>
                    <Icon
                      name="movie-open-outline"
                      size={20}
                      color={theme.colors.goldDim}
                    />
                  </ChipPlaceholder>
                )}
              </ChipButton>
            ))}

            {hasMore ? (
              <MoreChip
                onPress={() => navigation.navigate('WishlistList')}
                accessibilityRole="button"
                accessibilityLabel={t('common.accessibility.wishlistViewAll')}>
                <MoreLabel>
                  {t('common.units.moreItems', {
                    count: items.length - QUICK_LIMIT,
                  })}
                </MoreLabel>
              </MoreChip>
            ) : null}
          </ChipScroll>

          <SeeAllLink
            onPress={() => navigation.navigate('WishlistList')}
            accessibilityRole="button">
            <SeeAllText>{t('filmLog.wishlist.viewAll')}</SeeAllText>
            <Icon
              name="chevron-right"
              size={16}
              color={theme.colors.primaryMuted}
            />
          </SeeAllLink>
        </>
      )}
    </ArchivePanel>
  );
}

export default WishlistQuickRow;

const LoaderWrap = styled.View`
  min-height: ${CIRCLE_SIZE}px;
  align-items: center;
  justify-content: center;
`;

const ChipScroll = styled(ScrollView)`
  margin-top: 2px;
`;

const ChipButton = styled(Pressable)`
  width: ${CIRCLE_SIZE}px;
  height: ${CIRCLE_SIZE}px;
  border-radius: ${CIRCLE_SIZE / 2}px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const ChipPoster = styled(FastImage)`
  width: 100%;
  height: 100%;
`;

const ChipPlaceholder = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.posterPlaceholderBackground};
`;

const MoreChip = styled(Pressable)`
  width: ${CIRCLE_SIZE}px;
  height: ${CIRCLE_SIZE}px;
  border-radius: ${CIRCLE_SIZE / 2}px;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const MoreLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyMedium};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const SeeAllLink = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 2px;
  margin-top: 10px;
  padding: 4px;
`;

const SeeAllText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;
