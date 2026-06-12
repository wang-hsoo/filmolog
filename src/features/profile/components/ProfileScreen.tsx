import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Pressable, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled, { useTheme } from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import {
  ArchivePanel,
  ArchiveSectionHeader,
  Container,
  STATS_ICONS,
  STATS_LABELS,
} from '../../../components';
import {
  useAuth,
  useGetUserStats,
  useProfileContext,
} from '../../../lib/supabase';
import { useGetGenres } from '../../../lib/tmdb';
import { theme } from '../../../theme';

const TAGLINE =
  '오늘 당신의 마음을 움직인 단 하나의 장면은 무엇인가요?';

type StatKey = keyof typeof STATS_LABELS;

const STAT_ORDER: StatKey[] = [
  'reviewCount',
  'collectionCount',
  'wishlistCount',
  'avgRating',
];

type MenuItem = {
  key: string;
  label: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
};

function formatJoinedAt(createdAt: string | null): string | null {
  if (!createdAt) {
    return null;
  }

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d} 가입`;
}

function ProfileScreen() {
  const themeHook = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const tabNavigation = navigation.getParent();
  const { user } = useAuth();
  const { profile } = useProfileContext();
  const userId = user?.id ?? '';

  const { data: userStats } = useGetUserStats(userId);
  const { data: genreData } = useGetGenres();

  const preferredGenreNames = (profile?.preferred_genres ?? [])
    .map(id => genreData?.genres.find(genre => genre.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  const joinedLabel = formatJoinedAt(profile?.created_at ?? null);
  const nickname = profile?.nickname?.trim() || '필모그래퍼';

  const handleStatPress = (key: StatKey) => {
    switch (key) {
      case 'reviewCount':
        navigation.navigate('ReviewLogList');
        break;
      case 'collectionCount':
        navigation.navigate('CollectionList');
        break;
      case 'wishlistCount':
        navigation.navigate('WishlistList');
        break;
      case 'avgRating':
        tabNavigation?.navigate('통계' as never);
        break;
      default:
        break;
    }
  };

  const menuItems: MenuItem[] = [
    {
      key: 'reviews',
      label: '내 기록',
      subtitle: '작성한 리뷰 전체 보기',
      icon: 'notebook-outline',
      onPress: () => navigation.navigate('ReviewLogList'),
    },
    {
      key: 'collections',
      label: '내 컬렉션',
      subtitle: '큐레이션한 영화 목록',
      icon: 'folder-outline',
      onPress: () => navigation.navigate('CollectionList'),
    },
    {
      key: 'wishlist',
      label: '위시리스트',
      subtitle: '담아둔 영화',
      icon: 'bookmark-outline',
      onPress: () => navigation.navigate('WishlistList'),
    },
    {
      key: 'badges',
      label: '배지',
      subtitle: '획득한 업적 확인',
      icon: 'medal-outline',
      onPress: () => navigation.navigate('BadgeList'),
    },
  ];

  return (
    <Container isGetter={false}>
      <PageTopBar>
        <PageTopText>
          <PageTitle>마이페이지</PageTitle>
          <PageOverline>MY FILMOGRAPHY</PageOverline>
        </PageTopText>
        <SettingsButton
          onPress={() => navigation.navigate('Settings')}
          accessibilityRole="button"
          accessibilityLabel="설정">
          <Icon name="cog-outline" size={20} color={themeHook.colors.primary} />
        </SettingsButton>
      </PageTopBar>
      <TopRule />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Content>
          <ArchivePanel accent>
            <ProfileBlock>
              <Nickname>{nickname}</Nickname>
              {joinedLabel ? <JoinedAt>{joinedLabel}</JoinedAt> : null}
              {preferredGenreNames.length > 0 ? (
                <GenreRow>
                  {preferredGenreNames.map(name => (
                    <GenreChip key={name}>
                      <GenreChipText>{name}</GenreChipText>
                    </GenreChip>
                  ))}
                </GenreRow>
              ) : null}
              <Tagline>{TAGLINE}</Tagline>
            </ProfileBlock>
          </ArchivePanel>

          <ArchivePanel>
            <ArchiveSectionHeader
              overline="MY ARCHIVE"
              title="나의 기록"
              subtitle="쌓아온 영화의 흔적을 한눈에."
            />
            <StatsRow>
              {STAT_ORDER.map((key, index) => (
                <StatPressable
                  key={key}
                  onPress={() => handleStatPress(key)}
                  accessibilityRole="button">
                  <StatItem $isLast={index === STAT_ORDER.length - 1}>
                    <Icon
                      name={STATS_ICONS[key]}
                      size={22}
                      color={theme.colors.dashboardIcon}
                    />
                    <StatItemLabel numberOfLines={2}>
                      {STATS_LABELS[key]}
                    </StatItemLabel>
                    <StatItemValue>
                      {userStats?.[key] ?? '—'}
                    </StatItemValue>
                  </StatItem>
                </StatPressable>
              ))}
            </StatsRow>
          </ArchivePanel>

          <MenuPanel>
            {menuItems.map((item, index) => (
              <MenuRow
                key={item.key}
                onPress={item.onPress}
                $isLast={index === menuItems.length - 1}
                accessibilityRole="button">
                <MenuIconWrap>
                  <Icon
                    name={item.icon}
                    size={20}
                    color={theme.colors.primary}
                  />
                </MenuIconWrap>
                <MenuTextBlock>
                  <MenuLabel>{item.label}</MenuLabel>
                  <MenuSubtitle>{item.subtitle}</MenuSubtitle>
                </MenuTextBlock>
                <Icon
                  name="chevron-right"
                  size={20}
                  color={theme.colors.primaryMuted}
                />
              </MenuRow>
            ))}
          </MenuPanel>
        </Content>
      </ScrollView>
    </Container>
  );
}

export default ProfileScreen;

const H_PAD = 20;

const PageTopBar = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 6px ${H_PAD}px 10px;
`;

const PageTopText = styled.View`
  flex: 1;
  gap: 4px;
`;

const PageTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 24px;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const PageOverline = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 10px;
  letter-spacing: 3px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const SettingsButton = styled(Pressable)`
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const TopRule = styled.View`
  height: 1px;
  margin: 0 ${H_PAD}px 12px;
  background-color: ${({ theme }) => theme.colors.goldLine};
`;

const Content = styled.View`
  padding: 0 ${H_PAD}px 28px;
  gap: 14px;
`;

const ProfileBlock = styled.View`
  gap: 10px;
`;

const Nickname = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 22px;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const JoinedAt = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const GenreRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const GenreChip = styled.View`
  padding: 6px 12px;
  border-radius: 999px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const GenreChipText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary};
`;

const Tagline = styled.Text`
  margin-top: 4px;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 13px;
  line-height: 20px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const StatsRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const StatPressable = styled(Pressable)`
  flex: 1;
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

const MenuPanel = styled.View`
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  overflow: hidden;
`;

const MenuRow = styled(Pressable)<{ $isLast: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom-width: ${({ $isLast }) => ($isLast ? 0 : 1)}px;
  border-color: ${({ theme }) => theme.colors.dashbordItemBorder};
`;

const MenuIconWrap = styled.View`
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const MenuTextBlock = styled.View`
  flex: 1;
  gap: 3px;
`;

const MenuLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const MenuSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;
