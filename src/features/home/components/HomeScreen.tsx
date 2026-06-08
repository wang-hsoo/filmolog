import { Image, StyleSheet, Text } from 'react-native';
import styled from 'styled-components/native';

import { HOME_BANNER_ASPECT_RATIO, HOME_IMAGE } from '../constatns';
import { useGetUserStats } from '../../../lib/supabase';
import { useAuth } from '../../../lib/supabase';
import { Container, STATS_ICONS, STATS_LABELS } from '../../../components';
import { theme } from '../../../theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

function HomeScreen() {
    const { user } = useAuth();
    const { data: userStats } = useGetUserStats(user?.id ?? '');

    return (
        <Container isGetter={false}>
            <BannerFrame style={{ aspectRatio: HOME_BANNER_ASPECT_RATIO }}>
                <Image source={HOME_IMAGE.home} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
            </BannerFrame>

            <HomeContainer>
                <StatsContainer>
                    {Object.entries(userStats ?? {}).map(([key, value], index) => {
                        return (
                            <StatItem key={key} $isLast={index === Object.entries(userStats ?? {}).length - 1}>
                                <Icon name={STATS_ICONS[key as keyof typeof STATS_ICONS]} size={24} color={theme.colors.dashboardText} />
                                <StatItemLabel>{STATS_LABELS[key as keyof typeof STATS_LABELS]}</StatItemLabel>
                                <StatItemValue>{value}</StatItemValue>
                            </StatItem>
                        )
                    })}
                </StatsContainer>
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
  padding: 0 20px;
`;

const StatsContainer = styled.View`
  width: 100%;
  height: 113px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  padding: 10px;
  border-radius: 10px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorder};
`;

const StatItem = styled.View<{ $isLast: boolean}>`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 5px;

  border-right-width: ${({ $isLast }) => !$isLast ? 1 : 0}px;
  border-color: ${({ theme }) => theme.colors.dashbordItemBorder};
`;

const StatItemLabel = styled.Text`
  font-size: 16px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const StatItemValue = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.dashboardValue};
`;