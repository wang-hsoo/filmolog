import {
  CommonActions,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import FastImage from 'react-native-fast-image';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import MciIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import {
  ArchiveBannerAd,
  ArchiveNativeAd,
  ArchivePanel,
} from '../../../components';
import { getTmdbPosterUrl } from '../../../lib/tmdb/images';
import { AppScreen, theme } from '../../../theme';
import { formatRating } from '../utils/rating';

const H_PAD = 20;
const POSTER_WIDTH = 108;
const POSTER_HEIGHT = 162;
const POSTER_MAT = 3;

type CompleteRoute = RouteProp<RootStackParamList, 'FilmLogComplete'>;

function FilmLogCompleteScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<CompleteRoute>();
  const { reviewId, title, posterPath, rating, reviewNumber } = route.params;

  const posterUri = getTmdbPosterUrl(posterPath);
  const headline =
    reviewNumber === 1
      ? t('filmLog.complete.firstLog')
      : t('filmLog.complete.nthLog', { count: reviewNumber });

  const handleViewReview = () => {
    navigation.replace('ReviewDetail', { reviewId });
  };

  const handleRecordAnother = () => {
    navigation.replace('FilmLog');
  };

  const handleGoHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'App' }],
      }),
    );
  };

  return (
    <ScreenRoot style={{ paddingTop: insets.top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: H_PAD,
          paddingBottom: insets.bottom + 100,
        }}>
        <HeroPanel>
          <HeroTitle>{headline}</HeroTitle>
          <HeroMeta>
            {t('common.units.nthFilmWithRating', {
              count: reviewNumber,
              rating: formatRating(rating),
            })}
          </HeroMeta>

          <PosterMat>
            <PosterFrame>
              {posterUri ? (
                <Poster
                  source={{ uri: posterUri }}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <PosterPlaceholder />
              )}
            </PosterFrame>
          </PosterMat>

          <MovieTitle numberOfLines={2}>{title}</MovieTitle>

          <QuickLink onPress={handleViewReview} accessibilityRole="button">
            <QuickLinkLabel>{t('common.actions.viewLog')}</QuickLinkLabel>
            <Icon name="chevron-right" size={18} color={theme.colors.primary} />
          </QuickLink>
        </HeroPanel>

        <AdSection>
          <ArchivePanel>
            <ArchiveNativeAd />
          </ArchivePanel>
          {/* <ArchivePanel>
            <ArchiveNativeAd />
          </ArchivePanel> */}
          <ArchiveBannerAd />
        </AdSection>
      </ScrollView>

      <FooterBar style={{ paddingBottom: insets.bottom + 12 }}>
        <FooterButton onPress={handleRecordAnother} accessibilityRole="button">
          <FooterButtonLabel $muted>
            {t('filmLog.complete.recordAnother')}
          </FooterButtonLabel>
        </FooterButton>
        <FooterButton $primary onPress={handleGoHome} accessibilityRole="button">
          <MciIcon
            name="home-outline"
            size={18}
            color={theme.colors.appBackground}
          />
          <FooterButtonLabel $primary>{t('common.actions.home')}</FooterButtonLabel>
        </FooterButton>
      </FooterBar>
    </ScreenRoot>
  );
}

export default FilmLogCompleteScreen;

const ScreenRoot = styled(AppScreen)`
  flex: 1;
`;

const HeroPanel = styled.View`
  align-items: center;
  padding: 28px 20px 24px;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surfaceRaised};
  gap: 12px;
`;

const HeroTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 22px;
  letter-spacing: 0.3px;
  text-align: center;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const HeroMeta = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 14px;
  letter-spacing: 0.2px;
  text-align: center;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const PosterMat = styled.View`
  margin-top: 8px;
  padding: ${POSTER_MAT}px;
  border-radius: ${({ theme }) => theme.radii.poster + 2}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.posterBorder};
  background-color: ${({ theme }) => theme.colors.posterMat};
`;

const PosterFrame = styled.View`
  width: ${POSTER_WIDTH}px;
  height: ${POSTER_HEIGHT}px;
  border-radius: ${({ theme }) => theme.radii.poster}px;
  overflow: hidden;
`;

const Poster = styled(FastImage)`
  width: 100%;
  height: 100%;
`;

const PosterPlaceholder = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.posterPlaceholderBackground};
`;

const MovieTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 17px;
  line-height: 24px;
  text-align: center;
  color: ${({ theme }) => theme.colors.headerTitle};
`;

const QuickLink = styled.Pressable`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  padding: 10px 16px;
  border-radius: 999px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.goldLine};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const QuickLinkLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary};
`;

const AdSection = styled.View`
  margin-top: 16px;
  gap: 14px;
`;

const FooterBar = styled.View`
  position: absolute;
  right: ${H_PAD}px;
  bottom: 0;
  left: ${H_PAD}px;
  flex-direction: row;
  gap: 10px;
`;

const FooterButton = styled.Pressable<{ $primary?: boolean }>`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 50px;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme, $primary }) =>
    $primary ? theme.colors.goldSoft : theme.colors.dashborderBorderAccent};
  background-color: ${({ theme, $primary }) =>
    $primary ? theme.colors.primary : theme.colors.surfaceRaised};
`;

const FooterButtonLabel = styled.Text<{ $primary?: boolean; $muted?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: 15px;
  letter-spacing: 0.2px;
  color: ${({ theme, $primary, $muted }) =>
    $primary
      ? theme.colors.appBackground
      : $muted
        ? theme.colors.dashboardText
        : theme.colors.goldSoft};
`;
