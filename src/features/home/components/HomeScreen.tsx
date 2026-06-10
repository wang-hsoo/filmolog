import { Image } from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  ArchivePanel,
  ArchiveSectionHeader,
  Container,
  STATS_ICONS,
  STATS_LABELS,
} from '../../../components';
import { useAuth, useGetUserStats } from '../../../lib/supabase';
import { theme } from '../../../theme';
import { HOME_BANNER_ASPECT_RATIO, HOME_IMAGE } from '../constatns';

function HomeScreen() {
  const { user } = useAuth();
  const { data: userStats } = useGetUserStats(user?.id ?? '');

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
            title="나의 기록"
            subtitle="쌓아온 영화의 흔적을 한눈에."
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
                <StatItemLabel>
                  {STATS_LABELS[key as keyof typeof STATS_LABELS]}
                </StatItemLabel>
                <StatItemValue>{value}</StatItemValue>
              </StatItem>
            ))}
          </StatsRow>
        </ArchivePanel>
      </HomeContainer>
    </Container>
  );
}

export default HomeScreen;

const BannerFrame = styled.View`
  width: 100%;
`;

const HomeContainer = styled.View`
  flex: 1;
  padding: 0 20px 24px;
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
`;

const StatItemValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 20px;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.goldBright};
`;
