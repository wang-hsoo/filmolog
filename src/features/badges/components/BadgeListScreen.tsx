import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import {
  ALL_BADGE_IDS,
  BADGE_CATEGORY,
  BADGES,
  BADGES_BY_CATEGORY,
  type Badge,
  type BadgeCategory,
  type BadgeId,
} from '../../../components/constants/badge.constants';
import { ArchiveBannerAd, ArchiveEmptyText, ArchiveNativeAd, Header } from '../../../components';
import {
  getBadgeCategoryLabel,
  getBadgeDescription,
  getBadgeName,
} from '../../../i18n/labels';
import { useAuth, useGetUserBadges } from '../../../lib/supabase';
import { AppScreen, theme } from '../../../theme';

import BadgeUnlockOverlay from './BadgeUnlockOverlay';

function BadgeListScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [previewBadge, setPreviewBadge] = useState<Badge | null>(null);

  const { data: earnedBadges = [], isLoading, isError } =
    useGetUserBadges(userId);

  const earnedMap = new Map(
    earnedBadges.map(badge => [badge.badge_id, badge.earned_at]),
  );

  const categories = Object.values(BADGE_CATEGORY) as BadgeCategory[];

  const handleBadgePress = useCallback((badgeId: BadgeId, isEarned: boolean) => {
    if (!isEarned) {
      return;
    }

    setPreviewBadge(BADGES[badgeId]);
  }, []);

  const handleDismissPreview = useCallback(() => {
    setPreviewBadge(null);
  }, []);

  return (
    <AppScreen
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}>
      <Header navigation={navigation} subtitle="BADGES" hideRight />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Content>
          <SummaryRow>
            <SummaryLabel>{t('common.stats.earned')}</SummaryLabel>
            <SummaryValue>
              {earnedBadges.length} / {ALL_BADGE_IDS.length}
            </SummaryValue>
          </SummaryRow>

          {isLoading ? (
            <LoaderWrap>
              <ActivityIndicator color={theme.colors.primary} size="large" />
            </LoaderWrap>
          ) : isError ? (
            <ArchiveEmptyText>{t('badges.list.loadFailed')}</ArchiveEmptyText>
          ) : (
            categories.map(category => (
              <CategoryBlock key={category}>
                <CategoryTitle>
                  {getBadgeCategoryLabel(t, category)}
                </CategoryTitle>
                <BadgeGrid>
                  {BADGES_BY_CATEGORY[category].map((badgeId: BadgeId) => {
                    const badge = BADGES[badgeId];
                    const earnedAt = earnedMap.get(badgeId);
                    const isEarned = Boolean(earnedAt);

                    return (
                      <BadgeCard
                        key={badgeId}
                        $earned={isEarned}
                        onPress={() => handleBadgePress(badgeId, isEarned)}
                        disabled={!isEarned}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: !isEarned }}>
                        <BadgeIconWrap $earned={isEarned}>
                          <Image
                            source={badge.icon}
                            style={{
                              width: 48,
                              height: 48,
                              opacity: isEarned ? 1 : 0.35,
                            }}
                            resizeMode="contain"
                          />
                          {!isEarned ? (
                            <LockOverlay>
                              <Icon
                                name="lock-outline"
                                size={16}
                                color={theme.colors.primaryMuted}
                              />
                            </LockOverlay>
                          ) : null}
                        </BadgeIconWrap>
                        <BadgeName $earned={isEarned}>
                          {getBadgeName(t, badgeId)}
                        </BadgeName>
                        <BadgeDesc numberOfLines={2}>
                          {getBadgeDescription(t, badgeId)}
                        </BadgeDesc>
                      </BadgeCard>
                    );
                  })}
                </BadgeGrid>
              </CategoryBlock>
            ))
          )}
        </Content>
      </ScrollView>

      <BadgeUnlockOverlay
        badge={previewBadge}
        onDismiss={handleDismissPreview}
      />
    </AppScreen>
  );
}

export default BadgeListScreen;

const H_PAD = 20;

const Content = styled.View`
  padding: 8px ${H_PAD}px 32px;
  gap: 20px;
`;

const SummaryRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
`;

const SummaryLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const SummaryValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 18px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const LoaderWrap = styled.View`
  align-items: center;
  justify-content: center;
  min-height: 200px;
`;

const CategoryBlock = styled.View`
  gap: 12px;
`;

const CategoryTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 14px;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const BadgeGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
`;

const BadgeCard = styled(Pressable)<{ $earned: boolean }>`
  width: 47%;
  padding: 14px 12px;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme, $earned }) =>
    $earned ? theme.colors.dashboardBackground : theme.colors.surface};
  opacity: ${({ $earned }) => ($earned ? 1 : 0.85)};
  gap: 6px;
`;

const BadgeIconWrap = styled.View<{ $earned: boolean }>`
  align-self: flex-start;
  position: relative;
`;

const LockOverlay = styled.View`
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.appBackground};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
`;

const BadgeName = styled.Text<{ $earned: boolean }>`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 14px;
  color: ${({ theme, $earned }) =>
    $earned ? theme.colors.goldBright : theme.colors.primaryMuted};
`;

const BadgeDesc = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  line-height: 16px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;
