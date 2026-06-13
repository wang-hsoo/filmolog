import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '../../../app/navigation/types';

import {
  ArchivePanel,
  ArchiveSectionHeader,
  Container,
  STATS_ICONS,
} from '../../../components';
import { getStatsLabel } from '../../../i18n/labels';
import { useAuth, useGetUserStats, useGetUserReviewedMovies } from '../../../lib/supabase';
import { useGetCollections } from '../../../lib/supabase/collection';
import { theme } from '../../../theme';
import { HOME_BANNER_ASPECT_RATIO, HOME_IMAGE } from '../constatns';

import HomeCollectionShelf from './HomeCollectionShelf';
import HomeRecentLogs from './HomeRecentLogs';

function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();

  const { data: userStats } = useGetUserStats(user?.id ?? '');

  const { data: collections = [], isLoading: isCollectionsLoading } =
    useGetCollections(user?.id ?? '');
    
  const { data: reviewedMovies = [], isLoading: isReviewsLoading } =
    useGetUserReviewedMovies(user?.id ?? '');

  return (
    <Container isGetter={false}>
      <BannerFrame style={{ aspectRatio: HOME_BANNER_ASPECT_RATIO }}>
        <Image
          source={HOME_IMAGE.home}
          style={{ width: '100%', height: '100%' }}
          resizeMode="contain"
        />
      </BannerFrame>

      <HomeContainer>
        <ArchivePanel accent>
          <ArchiveSectionHeader
            overline="MY ARCHIVE"
            title={t('common.archive.myArchive.title')}
            subtitle={t('common.archive.myArchive.subtitle')}
          />

          <StatsRow>
            {Object.entries(userStats ?? {}).map(([key, value], index) => (
              <StatItem
                key={key}
                $isLast={
                  index === Object.entries(userStats ?? {}).length - 1
                }>
                <Icon
                  name={STATS_ICONS[key as keyof typeof STATS_ICONS]}
                  size={22}
                  color={theme.colors.dashboardIcon}
                />
                <StatItemLabel numberOfLines={2}>
                  {getStatsLabel(t, key as keyof typeof STATS_ICONS)}
                </StatItemLabel>
                <StatItemValue>{value}</StatItemValue>
              </StatItem>
            ))}
          </StatsRow>
        </ArchivePanel>

        <HomeCollectionShelf
          collections={collections}
          isLoading={isCollectionsLoading}
          onViewAll={() => navigation.navigate('CollectionList')}
          onPressCollection={collection =>
            navigation.navigate('CollectionDetail', {
              collectionId: collection.id,
            })
          }
        />

        <HomeRecentLogs
          reviews={reviewedMovies}
          isLoading={isReviewsLoading}
          onViewAll={() => navigation.navigate('ReviewLogList')}
          onPressReview={review =>
            navigation.navigate('ReviewDetail', {
              reviewId: review.reviewId,
            })
          }
        />
      </HomeContainer>
    </Container>
  );
}

export default HomeScreen;

const BannerFrame = styled.View`
  width: 100%;
`;

const HomeContainer = styled.View`
  padding: 0 20px 24px;
  gap: 14px;
`;

const StatsRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const StatItem = styled.View<{ $isLast: boolean }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding-top: 4px;
  padding-bottom: 4px;
  border-right-width: ${({ $isLast }) => ($isLast ? 0 : 1)}px;
  border-color: ${({ theme }) => theme.colors.dashbordItemBorder};
`;

const StatItemLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.dashboardText};
  text-align: center;
`;

const StatItemValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 20px;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.goldBright};
`;
