import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import { ArchiveEmptyText, Header } from '../../../components';
import { useAuth, useGetUserWishlist } from '../../../lib/supabase';
import { getTmdbPosterUrl } from '../../../lib/tmdb/images';
import { AppScreen, theme } from '../../../theme';

function WishlistListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const { data: items = [], isLoading, isError } = useGetUserWishlist(userId);

  return (
    <AppScreen
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}>
      <Header navigation={navigation} subtitle="WISHLIST" hideRight />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Content>
          {isLoading ? (
            <LoaderWrap>
              <ActivityIndicator color={theme.colors.primary} size="large" />
            </LoaderWrap>
          ) : isError ? (
            <ArchiveEmptyText>
              위시리스트를 불러오지 못했습니다.
            </ArchiveEmptyText>
          ) : items.length === 0 ? (
            <ArchiveEmptyText>담아둔 영화가 없습니다.</ArchiveEmptyText>
          ) : (
            items.map(item => (
              <MovieRow
                key={item.tmdbId}
                onPress={() =>
                  navigation.navigate('MovieDetail', { tmdbId: item.tmdbId })
                }
                accessibilityRole="button">
                <PosterWrap>
                  {item.posterPath ? (
                    <Poster
                      source={{ uri: getTmdbPosterUrl(item.posterPath) }}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  ) : (
                    <PosterPlaceholder />
                  )}
                </PosterWrap>
                <MovieInfo>
                  <MovieTitle numberOfLines={2}>{item.title}</MovieTitle>
                </MovieInfo>
              </MovieRow>
            ))
          )}
        </Content>
      </ScrollView>
    </AppScreen>
  );
}

export default WishlistListScreen;

const H_PAD = 20;

const Content = styled.View`
  padding: 8px ${H_PAD}px 32px;
  gap: 12px;
`;

const LoaderWrap = styled.View`
  align-items: center;
  justify-content: center;
  min-height: 200px;
`;

const MovieRow = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
`;

const PosterWrap = styled.View`
  width: 56px;
  height: 84px;
  border-radius: 6px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
`;

const Poster = styled(FastImage)`
  width: 100%;
  height: 100%;
`;

const PosterPlaceholder = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const MovieInfo = styled.View`
  flex: 1;
  gap: 4px;
`;

const MovieTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 15px;
  line-height: 21px;
  color: ${({ theme }) => theme.colors.goldBright};
`;
