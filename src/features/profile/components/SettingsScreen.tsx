import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import { Header } from '../../../components';
import { resetToAppScreen } from '../../../app/navigation/navigationRef';
import { archiveAlert } from '../../../lib/dialog/archiveDialog';
import {
  openFeedbackForm,
  type FeedbackFormType,
} from '../../../lib/feedback/googleFeedbackForm';
import {
  DeleteAccountError,
  deleteUserAccount,
  signOutFromApp,
  useAuth,
} from '../../../lib/supabase';
import { AppScreen, theme } from '../../../theme';

const APP_VERSION = '0.0.1';

function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = () => {
    archiveAlert('로그아웃', '정말 로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: () => {
          resetToAppScreen();

          void signOutFromApp().catch(error => {
            console.error('[SettingsScreen] signOut failed', error);
            archiveAlert('로그아웃 실패', '잠시 후 다시 시도해주세요.');
          });
        },
      },
    ]);
  };

  const handleDeleteAccount = useCallback(() => {
    if (!user?.id || isDeleting) {
      return;
    }

    archiveAlert(
      '회원 탈퇴',
      '탈퇴 시 작성한 리뷰, 컬렉션, 위시리스트 등 모든 기록이 삭제되며 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴하기',
          style: 'destructive',
          onPress: () => {
            setIsDeleting(true);
            resetToAppScreen();

            void deleteUserAccount(user.id)
              .catch(error => {
                console.error('[SettingsScreen] deleteAccount failed', error);

                const message =
                  error instanceof DeleteAccountError
                    ? error.message
                    : '회원 탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해주세요.';

                archiveAlert('탈퇴 실패', message);
              })
              .finally(() => {
                setIsDeleting(false);
              });
          },
        },
      ],
    );
  }, [isDeleting, navigation, user?.id]);

  const handleOpenFeedback = useCallback(
    (type: FeedbackFormType) => {
      void openFeedbackForm({
        type,
        appVersion: APP_VERSION,
        userId: user?.id,
      }).catch(error => {
        console.error('[SettingsScreen] openFeedbackForm failed', error);
        archiveAlert(
          '열기 실패',
          'Google Form을 열 수 없습니다. 잠시 후 다시 시도해주세요.',
        );
      });
    },
    [user?.id],
  );

  return (
    <AppScreen
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}>
      <Header navigation={navigation} subtitle="SETTINGS" hideRight />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Content>
          <SectionLabel>계정</SectionLabel>
          <MenuPanel>
            <MenuRow
              onPress={() => navigation.navigate('GenreEdit')}
              accessibilityRole="button">
              <MenuIconWrap>
                <Icon
                  name="movie-filter-outline"
                  size={20}
                  color={theme.colors.primary}
                />
              </MenuIconWrap>
              <MenuTextBlock>
                <MenuLabel>선호 장르 변경</MenuLabel>
                <MenuSubtitle>탐색 추천에 반영되는 장르</MenuSubtitle>
              </MenuTextBlock>
              <Icon
                name="chevron-right"
                size={20}
                color={theme.colors.primaryMuted}
              />
            </MenuRow>
          </MenuPanel>

          <SectionLabel>지원</SectionLabel>
          <SupportNotice>
            Filmolog는 1인으로 운영 중이에요. 남겨주신 의견은 순차 검토하며,
            반영 시점은 작업 규모에 따라 달라질 수 있어요.
          </SupportNotice>
          <MenuPanel>
            <MenuRow
              onPress={() => handleOpenFeedback('feature')}
              accessibilityRole="button">
              <MenuIconWrap>
                <Icon
                  name="lightbulb-outline"
                  size={20}
                  color={theme.colors.primary}
                />
              </MenuIconWrap>
              <MenuTextBlock>
                <MenuLabel>기능 제안하기</MenuLabel>
                <MenuSubtitle>아이디어를 남겨주시면 검토 후 반영해요</MenuSubtitle>
              </MenuTextBlock>
              <Icon
                name="open-in-new"
                size={18}
                color={theme.colors.primaryMuted}
              />
            </MenuRow>

            <MenuDivider />

            <MenuRow
              onPress={() => handleOpenFeedback('bug')}
              accessibilityRole="button">
              <MenuIconWrap>
                <Icon
                  name="bug-outline"
                  size={20}
                  color={theme.colors.primary}
                />
              </MenuIconWrap>
              <MenuTextBlock>
                <MenuLabel>오류 제보하기</MenuLabel>
                <MenuSubtitle>접수 후 순차 수정 · 버전·계정은 자동 입력</MenuSubtitle>
              </MenuTextBlock>
              <Icon
                name="open-in-new"
                size={18}
                color={theme.colors.primaryMuted}
              />
            </MenuRow>
          </MenuPanel>

          <SectionLabel>앱</SectionLabel>
          <MenuPanel>
            <InfoRow>
              <MenuTextBlock>
                <MenuLabel>버전</MenuLabel>
                <MenuSubtitle>Filmolog</MenuSubtitle>
              </MenuTextBlock>
              <VersionText>{APP_VERSION}</VersionText>
            </InfoRow>
          </MenuPanel>

          <SectionLabel>계정 관리</SectionLabel>
          <MenuPanel>
            <MenuRow onPress={handleLogout} accessibilityRole="button">
              <MenuIconWrap>
                <Icon
                  name="logout"
                  size={20}
                  color={theme.colors.primary}
                />
              </MenuIconWrap>
              <MenuTextBlock>
                <MenuLabel>로그아웃</MenuLabel>
                <MenuSubtitle>다시 로그인할 수 있어요</MenuSubtitle>
              </MenuTextBlock>
            </MenuRow>

            <MenuDivider />

            <MenuRow
              onPress={handleDeleteAccount}
              disabled={isDeleting}
              accessibilityRole="button">
              <MenuIconWrap $danger>
                <Icon
                  name="account-remove-outline"
                  size={20}
                  color={theme.colors.goldDim}
                />
              </MenuIconWrap>
              <MenuTextBlock>
                <MenuLabel $danger>회원 탈퇴</MenuLabel>
                <MenuSubtitle>모든 기록이 영구 삭제됩니다</MenuSubtitle>
              </MenuTextBlock>
              {isDeleting ? (
                <ActivityIndicator color={theme.colors.goldDim} size="small" />
              ) : null}
            </MenuRow>
          </MenuPanel>
        </Content>
      </ScrollView>
    </AppScreen>
  );
}

export default SettingsScreen;

const H_PAD = 20;

const Content = styled.View`
  padding: 8px ${H_PAD}px 32px;
  gap: 10px;
`;

const SectionLabel = styled.Text`
  margin-top: 8px;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 10px;
  letter-spacing: 2px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const SupportNotice = styled.Text`
  margin: -2px 2px 0;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  line-height: 18px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const MenuPanel = styled.View`
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  overflow: hidden;
`;

const MenuRow = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 16px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const MenuDivider = styled.View`
  height: 1px;
  margin: 0 16px;
  background-color: ${({ theme }) => theme.colors.dashbordItemBorder};
`;

const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 16px;
`;

const MenuIconWrap = styled.View<{ $danger?: boolean }>`
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border-width: 1px;
  border-color: ${({ theme, $danger }) =>
    $danger ? theme.colors.goldLine : theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const MenuTextBlock = styled.View`
  flex: 1;
  gap: 3px;
`;

const MenuLabel = styled.Text<{ $danger?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 15px;
  color: ${({ theme, $danger }) =>
    $danger ? theme.colors.goldDim : theme.colors.goldBright};
`;

const MenuSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const VersionText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;
