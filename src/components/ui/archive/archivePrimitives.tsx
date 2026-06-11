import type { PropsWithChildren } from 'react';
import styled from 'styled-components/native';

import { brandLetterSpacing } from '../../../theme/typography';

const H_PAD = 20;

export function ArchivePanel({
  children,
  accent = false,
  compact = false,
}: PropsWithChildren<{ accent?: boolean; compact?: boolean }>) {
  return (
    <PanelRoot>
      {accent ? <PanelAccent /> : null}
      <PanelBody $compact={compact}>{children}</PanelBody>
    </PanelRoot>
  );
}

type ArchivePageHeaderProps = {
  title: string;
  subtitle?: string;
};

export function ArchivePageHeader({ title, subtitle }: ArchivePageHeaderProps) {
  return (
    <PageHeader>
      <PageTitle>{title}</PageTitle>
      {subtitle ? <PageSubtitle>{subtitle}</PageSubtitle> : null}
      <GoldRule />
    </PageHeader>
  );
}

type ArchiveSectionHeaderProps = {
  title: string;
  subtitle?: string;
  overline?: string;
};

export function ArchiveSectionHeader({
  overline,
  title,
  subtitle,
}: ArchiveSectionHeaderProps) {
  return (
    <SectionHeader>
      {overline ? <SectionOverline>{overline}</SectionOverline> : null}
      <SectionTitle>{title}</SectionTitle>
      {subtitle ? <SectionSubtitle>{subtitle}</SectionSubtitle> : null}
    </SectionHeader>
  );
}

export function ArchiveEmptyText({ children }: PropsWithChildren) {
  return <EmptyText>{children}</EmptyText>;
}

const PanelRoot = styled.View`
  width: 100%;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  overflow: hidden;
`;

const PanelAccent = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const PanelBody = styled.View<{ $compact?: boolean }>`
  padding: 16px;
  padding-bottom: ${({ $compact }) => ($compact ? 10 : 16)}px;
`;

const PageHeader = styled.View`
  gap: 8px;
  padding: 12px ${H_PAD}px 4px;
`;

const PageTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 28px;
  letter-spacing: 1px;
  color: ${({ theme }) => theme.colors.headerTitle};
`;

const PageSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 13px;
  line-height: 20px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const GoldRule = styled.View`
  height: 1px;
  margin-top: 4px;
  background-color: ${({ theme }) => theme.colors.goldLine};
`;

const SectionHeader = styled.View`
  gap: 4px;
  margin-bottom: 14px;
`;

const SectionOverline = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 10px;
  letter-spacing: ${brandLetterSpacing}px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const SectionTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 17px;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const SectionSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 13px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const EmptyText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 13px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

export const ArchiveSearchPanel = styled.View`
  margin: 0 ${H_PAD}px 14px;
  padding: 0px 14px;
  border-radius: ${({ theme }) => theme.radii.search}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const ArchiveSearchInput = styled.TextInput`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 15px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

export const ArchiveListFrame = styled.View`
  flex: 1;
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  overflow: hidden;
`;

export const ArchiveContent = styled.View`
  flex: 1;
  padding: 0 ${H_PAD}px 24px;
  gap: 14px;
`;

export const ARCHIVE_HORIZONTAL_PADDING = H_PAD;
