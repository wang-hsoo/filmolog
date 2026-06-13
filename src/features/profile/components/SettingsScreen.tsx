import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import { Header, TmdbAttribution } from '../../../components';
import { resetToAppScreen } from '../../../app/navigation/navigationRef';
import { useAppLocale } from '../../../i18n/I18nProvider';
import type { AppLocale } from '../../../i18n/types';
import { archiveAlert } from '../../../lib/dialog/archiveDialog';
import {
  openFeedbackForm,
  type FeedbackFormType,
} from '../../../lib/feedback/googleFeedbackForm';
import { openPrivacyPolicy } from '../../../lib/links/legalLinks';
import {
  DeleteAccountError,
  deleteUserAccount,
  signOutFromApp,
  useAuth,
} from '../../../lib/supabase';
import { AppScreen, theme } from '../../../theme';

const APP_VERSION = '0.0.1';

function SettingsScreen() {
  const { t } = useTranslation();
  const { locale, setLocale } = useAppLocale();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = () => {
    archiveAlert(t('dialogs.logout.title'), t('dialogs.logout.message'), [
      { text: t('common.actions.cancel'), style: 'cancel' },
      {
        text: t('dialogs.logout.confirm'),
        style: 'destructive',
        onPress: () => {
          resetToAppScreen();

          void signOutFromApp().catch(error => {
            console.error('[SettingsScreen] signOut failed', error);
            archiveAlert(
              t('errors.logoutFailed.title'),
              t('errors.logoutFailed.message'),
            );
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
      t('dialogs.deleteAccount.title'),
      t('dialogs.deleteAccount.message'),
      [
        { text: t('common.actions.cancel'), style: 'cancel' },
        {
          text: t('dialogs.deleteAccount.confirm'),
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
                    : t('errors.deleteAccount.rpcFailedRetry');

                archiveAlert(t('dialogs.deleteAccount.failedTitle'), message);
              })
              .finally(() => {
                setIsDeleting(false);
              });
          },
        },
      ],
    );
  }, [isDeleting, navigation, t, user?.id]);

  const handleOpenFeedback = useCallback(
    (type: FeedbackFormType) => {
      void openFeedbackForm({
        type,
        appVersion: APP_VERSION,
        userId: user?.id,
      }).catch(error => {
        console.error('[SettingsScreen] openFeedbackForm failed', error);
        archiveAlert(
          t('errors.openFailed.title'),
          t('errors.openFailed.googleForm'),
        );
      });
    },
    [t, user?.id],
  );

  const handleOpenPrivacyPolicy = useCallback(() => {
    void openPrivacyPolicy().catch(error => {
      console.error('[SettingsScreen] openPrivacyPolicy failed', error);
      archiveAlert(
        t('errors.openFailed.title'),
        t('errors.openFailed.privacyPolicy'),
      );
    });
  }, [t]);

  const handleSelectLocale = useCallback(
    (nextLocale: AppLocale) => {
      if (nextLocale !== locale) {
        void setLocale(nextLocale);
      }
    },
    [locale, setLocale],
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
          <SectionLabel>{t('settings.sections.account')}</SectionLabel>
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
                <MenuLabel>{t('settings.account.genreEdit.label')}</MenuLabel>
                <MenuSubtitle>
                  {t('settings.account.genreEdit.subtitle')}
                </MenuSubtitle>
              </MenuTextBlock>
              <Icon
                name="chevron-right"
                size={20}
                color={theme.colors.primaryMuted}
              />
            </MenuRow>
          </MenuPanel>

          <SectionLabel>{t('settings.sections.support')}</SectionLabel>
          <SupportNotice>{t('settings.support.notice')}</SupportNotice>
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
                <MenuLabel>{t('settings.support.featureRequest.label')}</MenuLabel>
                <MenuSubtitle>
                  {t('settings.support.featureRequest.subtitle')}
                </MenuSubtitle>
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
                <MenuLabel>{t('settings.support.bugReport.label')}</MenuLabel>
                <MenuSubtitle>
                  {t('settings.support.bugReport.subtitle')}
                </MenuSubtitle>
              </MenuTextBlock>
              <Icon
                name="open-in-new"
                size={18}
                color={theme.colors.primaryMuted}
              />
            </MenuRow>
          </MenuPanel>

          <SectionLabel>{t('settings.sections.legal')}</SectionLabel>
          <MenuPanel>
            <MenuRow
              onPress={handleOpenPrivacyPolicy}
              accessibilityRole="button">
              <MenuIconWrap>
                <Icon
                  name="shield-account-outline"
                  size={20}
                  color={theme.colors.primary}
                />
              </MenuIconWrap>
              <MenuTextBlock>
                <MenuLabel>{t('settings.legal.privacyPolicy.label')}</MenuLabel>
                <MenuSubtitle>
                  {t('settings.legal.privacyPolicy.subtitle')}
                </MenuSubtitle>
              </MenuTextBlock>
              <Icon
                name="open-in-new"
                size={18}
                color={theme.colors.primaryMuted}
              />
            </MenuRow>
          </MenuPanel>

          <SectionLabel>{t('settings.sections.app')}</SectionLabel>
          <MenuPanel>
            <InfoRow>
              <MenuTextBlock>
                <MenuLabel>{t('settings.app.version.label')}</MenuLabel>
                <MenuSubtitle>{t('settings.app.version.subtitle')}</MenuSubtitle>
              </MenuTextBlock>
              <VersionText>{APP_VERSION}</VersionText>
            </InfoRow>

            <MenuDivider />

            <InfoRow>
              <MenuTextBlock>
                <MenuLabel>{t('settings.language.label')}</MenuLabel>
                <MenuSubtitle>{t('settings.language.subtitle')}</MenuSubtitle>
              </MenuTextBlock>
            </InfoRow>

            <MenuDivider />

            <MenuRow
              onPress={() => handleSelectLocale('ko')}
              accessibilityRole="button">
              <MenuTextBlock>
                <MenuLabel>{t('settings.language.ko')}</MenuLabel>
              </MenuTextBlock>
              {locale === 'ko' ? (
                <Icon name="check" size={20} color={theme.colors.primary} />
              ) : null}
            </MenuRow>

            <MenuDivider />

            <MenuRow
              onPress={() => handleSelectLocale('en')}
              accessibilityRole="button">
              <MenuTextBlock>
                <MenuLabel>{t('settings.language.en')}</MenuLabel>
              </MenuTextBlock>
              {locale === 'en' ? (
                <Icon name="check" size={20} color={theme.colors.primary} />
              ) : null}
            </MenuRow>

            <MenuDivider />

            <TmdbAttribution compact />
          </MenuPanel>

          <SectionLabel>{t('settings.sections.accountManagement')}</SectionLabel>
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
                <MenuLabel>{t('settings.accountManagement.logout.label')}</MenuLabel>
                <MenuSubtitle>
                  {t('settings.accountManagement.logout.subtitle')}
                </MenuSubtitle>
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
                <MenuLabel $danger>
                  {t('settings.accountManagement.deleteAccount.label')}
                </MenuLabel>
                <MenuSubtitle>
                  {t('settings.accountManagement.deleteAccount.subtitle')}
                </MenuSubtitle>
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
