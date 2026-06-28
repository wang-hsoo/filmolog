import { forwardRef, useMemo } from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import styled from 'styled-components/native';

export const CALENDAR_SHARE_CARD_WIDTH = 360;
export const CALENDAR_SHARE_CARD_HEIGHT = 640;

export const CALENDAR_SHARE_EXPORT_WIDTH = 1080;
export const CALENDAR_SHARE_EXPORT_HEIGHT = 1920;

export type CalendarShareDayCell = {
  key: string;
  day: number | null;
  posterUri: string | null;
  reviewCount: number;
  isToday: boolean;
  isFuture: boolean;
};

export type ReviewCalendarShareCardProps = {
  monthTitle: string;
  yearLabel: string;
  monthLabel: string;
  progressLabel: string;
  captionLabel: string;
  weekdayLabels: string[];
  days: CalendarShareDayCell[];
  filmCountLabel: string;
  footerTagline: string;
  highlightPosterUris: string[];
};

function chunkWeekRows(days: CalendarShareDayCell[]) {
  const rows: CalendarShareDayCell[][] = [];

  for (let index = 0; index < days.length; index += 7) {
    rows.push(days.slice(index, index + 7));
  }

  return rows;
}

const ReviewCalendarShareCard = forwardRef<View, ReviewCalendarShareCardProps>(
  (
    {
      monthTitle,
      yearLabel,
      monthLabel,
      progressLabel,
      captionLabel,
      weekdayLabels,
      days,
      filmCountLabel,
      footerTagline,
      highlightPosterUris,
    },
    ref,
  ) => {
    const progressRatio = useMemo(() => {
      const match = progressLabel.match(/(\d+)\/(\d+)/);

      if (!match) {
        return 0;
      }

      const filled = Number.parseInt(match[1], 10);
      const total = Number.parseInt(match[2], 10);

      return total > 0 ? filled / total : 0;
    }, [progressLabel]);

    const weekRows = useMemo(() => chunkWeekRows(days), [days]);
    const moodPosters = highlightPosterUris.slice(0, 4);
    const stripPosters = highlightPosterUris.slice(0, 5);

    return (
      <View
        ref={ref}
        collapsable={false}
        style={{
          width: CALENDAR_SHARE_CARD_WIDTH,
          height: CALENDAR_SHARE_CARD_HEIGHT,
          backgroundColor: '#050504',
        }}>
        <CanvasRoot>
          {moodPosters.map((uri, index) => (
            <MoodPosterWrap
              key={`${uri}-${index}`}
              $index={index}
              $total={moodPosters.length}>
              <MoodPoster
                source={{ uri }}
                resizeMode={FastImage.resizeMode.cover}
              />
            </MoodPosterWrap>
          ))}

          <LinearGradient
            colors={[
              'rgba(5, 5, 4, 0.55)',
              'rgba(8, 7, 6, 0.82)',
              'rgba(5, 5, 4, 0.92)',
            ]}
            locations={[0, 0.45, 1]}
            style={{ flex: 1 }}>
            <GlowOrb $side="left" />
            <GlowOrb $side="right" />

            <CanvasInner>
              <TopRow>
                <BrandMark>FILMOLOG</BrandMark>
                <FilmCountPill>{filmCountLabel}</FilmCountPill>
              </TopRow>

              <HeroBlock>
                <YearLabel>{yearLabel}</YearLabel>
                <MonthTitle>{monthLabel}</MonthTitle>
                <HeroCaption>{captionLabel}</HeroCaption>

                <StatsRow>
                  <StatChip>
                    <StatChipValue>{progressLabel}</StatChipValue>
                  </StatChip>
                  <ProgressTrack>
                    <ProgressFill $ratio={progressRatio} />
                  </ProgressTrack>
                </StatsRow>
              </HeroBlock>

              <CalendarBlock>
                <WeekdayRow>
                  {weekdayLabels.map(label => (
                    <WeekdayCell key={label}>
                      <WeekdayLabel>{label}</WeekdayLabel>
                    </WeekdayCell>
                  ))}
                </WeekdayRow>

                <Grid>
                  {weekRows.map((row, rowIndex) => (
                    <GridRow key={`row-${rowIndex}`}>
                      {row.map(cell =>
                        cell.day == null ? (
                          <GridSpacer key={cell.key} />
                        ) : (
                          <DayCell
                            key={cell.key}
                            $hasPoster={Boolean(cell.posterUri)}>
                            {cell.posterUri ? (
                              <>
                                <DayPoster
                                  source={{ uri: cell.posterUri }}
                                  resizeMode={FastImage.resizeMode.cover}
                                />
                                <DayShade />
                                <DayBadge $today={cell.isToday}>
                                  <DayBadgeLabel $today={cell.isToday}>
                                    {cell.day}
                                  </DayBadgeLabel>
                                </DayBadge>
                                {cell.reviewCount > 1 ? (
                                  <CountBadge>
                                    <CountBadgeLabel>
                                      +{cell.reviewCount - 1}
                                    </CountBadgeLabel>
                                  </CountBadge>
                                ) : null}
                              </>
                            ) : (
                              <EmptyDay
                                $today={cell.isToday}
                                $future={cell.isFuture}>
                                <EmptyDayLabel
                                  $today={cell.isToday}
                                  $future={cell.isFuture}>
                                  {cell.day}
                                </EmptyDayLabel>
                              </EmptyDay>
                            )}
                          </DayCell>
                        ),
                      )}
                    </GridRow>
                  ))}
                </Grid>
              </CalendarBlock>

              <BottomBlock>
                {stripPosters.length > 0 ? (
                  <FilmStrip>
                    {stripPosters.map((uri, index) => (
                      <StripPosterWrap
                        key={`${uri}-${index}`}
                        $index={index}
                        $total={stripPosters.length}>
                        <StripPoster
                          source={{ uri }}
                          resizeMode={FastImage.resizeMode.cover}
                        />
                      </StripPosterWrap>
                    ))}
                  </FilmStrip>
                ) : null}

                <FooterRow>
                  <FooterDot />
                  <FooterTagline>{footerTagline}</FooterTagline>
                  <FooterDot />
                </FooterRow>
                <FooterMonth>{monthTitle}</FooterMonth>
              </BottomBlock>
            </CanvasInner>
          </LinearGradient>
        </CanvasRoot>
      </View>
    );
  },
);

ReviewCalendarShareCard.displayName = 'ReviewCalendarShareCard';

export default ReviewCalendarShareCard;

const CanvasRoot = styled.View`
  flex: 1;
  overflow: hidden;
  background-color: #050504;
`;

const MoodPosterWrap = styled.View<{ $index: number; $total: number }>`
  position: absolute;
  width: ${({ $total }) => ($total <= 2 ? 52 : 44)}%;
  aspect-ratio: 0.68;
  border-radius: 14px;
  overflow: hidden;
  opacity: 0.22;
  top: ${({ $index }) => {
    if ($index === 0) {
      return '-4%';
    }
    if ($index === 1) {
      return '8%';
    }
    if ($index === 2) {
      return '62%';
    }
    return '72%';
  }};
  left: ${({ $index }) => {
    if ($index === 0) {
      return '-8%';
    }
    if ($index === 1) {
      return '58%';
    }
    if ($index === 2) {
      return '-6%';
    }
    return '62%';
  }};
  transform: rotate(
    ${({ $index }) => {
      if ($index === 0) {
        return '-8deg';
      }
      if ($index === 1) {
        return '6deg';
      }
      if ($index === 2) {
        return '5deg';
      }
      return '-5deg';
    }}
  );
`;

const MoodPoster = styled(FastImage)`
  width: 100%;
  height: 100%;
`;

const GlowOrb = styled.View<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: ${({ $side }) => ($side === 'left' ? '12%' : '58%')};
  ${({ $side }) => ($side === 'left' ? 'left: -18%' : 'right: -18%')};
  width: 46%;
  aspect-ratio: 1;
  border-radius: 999px;
  background-color: rgba(184, 149, 107, 0.08);
`;

const CanvasInner = styled.View`
  flex: 1;
  padding: 22px 24px 20px;
`;

const TopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const BrandMark = styled.Text`
  font-family: GowunBatang-Bold;
  font-size: 11px;
  letter-spacing: 5px;
  color: rgba(184, 149, 107, 0.88);
`;

const FilmCountPill = styled.Text`
  padding: 5px 11px;
  border-radius: 999px;
  overflow: hidden;
  font-family: Pretendard-Medium;
  font-size: 10px;
  color: #dcc9a8;
  background-color: rgba(184, 149, 107, 0.1);
  border-width: 1px;
  border-color: rgba(184, 149, 107, 0.28);
`;

const HeroBlock = styled.View`
  align-items: center;
  margin-bottom: 14px;
  gap: 4px;
`;

const YearLabel = styled.Text`
  font-family: Pretendard-Regular;
  font-size: 11px;
  letter-spacing: 3px;
  color: rgba(184, 149, 107, 0.72);
`;

const MonthTitle = styled.Text`
  font-family: GowunBatang-Bold;
  font-size: 36px;
  line-height: 42px;
  color: #f5efe6;
  text-align: center;
`;

const HeroCaption = styled.Text`
  margin-top: 2px;
  font-family: GowunBatang-Regular;
  font-size: 12px;
  line-height: 18px;
  color: rgba(168, 155, 142, 0.88);
  text-align: center;
`;

const StatsRow = styled.View`
  width: 100%;
  margin-top: 10px;
  gap: 8px;
  align-items: center;
`;

const StatChip = styled.View`
  padding: 6px 14px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.04);
  border-width: 1px;
  border-color: rgba(184, 149, 107, 0.18);
`;

const StatChipValue = styled.Text`
  font-family: Pretendard-Regular;
  font-size: 11px;
  color: #c4b5a3;
  letter-spacing: 0.3px;
`;

const ProgressTrack = styled.View`
  width: 72%;
  height: 3px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.06);
  overflow: hidden;
`;

const ProgressFill = styled.View<{ $ratio: number }>`
  width: ${({ $ratio }) => `${Math.min(Math.max($ratio, 0), 1) * 100}%`};
  height: 100%;
  border-radius: 999px;
  background-color: #b8956b;
`;

const CalendarBlock = styled.View`
  flex: 1;
  min-height: 0;
  gap: 6px;
`;

const WeekdayRow = styled.View`
  flex-direction: row;
  padding: 0 1px;
`;

const WeekdayCell = styled.View`
  flex: 1;
  align-items: center;
`;

const WeekdayLabel = styled.Text`
  font-family: Pretendard-Regular;
  font-size: 9px;
  letter-spacing: 0.5px;
  color: rgba(122, 111, 99, 0.92);
`;

const Grid = styled.View`
  flex: 1;
  min-height: 0;
  gap: 3px;
`;

const GridRow = styled.View`
  flex: 1;
  flex-direction: row;
  gap: 3px;
`;

const GridSpacer = styled.View`
  flex: 1;
`;

const DayCell = styled.View<{ $hasPoster: boolean }>`
  flex: 1;
  border-radius: 7px;
  overflow: hidden;
  border-width: ${({ $hasPoster }) => ($hasPoster ? 1 : 0.5)}px;
  border-color: ${({ $hasPoster }) =>
    $hasPoster ? 'rgba(74, 61, 48, 0.9)' : 'rgba(42, 35, 28, 0.85)'};
  background-color: rgba(255, 255, 255, 0.02);
`;

const DayPoster = styled(FastImage)`
  width: 100%;
  height: 100%;
`;

const DayShade = styled(LinearGradient).attrs({
  colors: ['transparent', 'rgba(0, 0, 0, 0.45)'],
  locations: [0.35, 1],
})`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50%;
`;

const DayBadge = styled.View<{ $today: boolean }>`
  position: absolute;
  top: 3px;
  left: 3px;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $today }) =>
    $today ? '#b8956b' : 'rgba(8, 8, 7, 0.78)'};
`;

const DayBadgeLabel = styled.Text<{ $today: boolean }>`
  font-family: Pretendard-SemiBold;
  font-size: 9px;
  color: ${({ $today }) => ($today ? '#080807' : '#f2ebe0')};
`;

const CountBadge = styled.View`
  position: absolute;
  right: 3px;
  bottom: 3px;
  min-width: 16px;
  height: 14px;
  padding: 0 3px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  background-color: rgba(8, 8, 7, 0.84);
  border-width: 1px;
  border-color: rgba(184, 149, 107, 0.35);
`;

const CountBadgeLabel = styled.Text`
  font-family: Pretendard-SemiBold;
  font-size: 8px;
  color: #dcc9a8;
`;

const EmptyDay = styled.View<{ $today: boolean; $future: boolean }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  border-width: 1px;
  border-style: dashed;
  border-color: ${({ $today }) =>
    $today ? 'rgba(138, 112, 82, 0.85)' : 'rgba(42, 35, 28, 0.9)'};
  background-color: ${({ $today }) =>
    $today ? 'rgba(184, 149, 107, 0.06)' : 'rgba(255, 255, 255, 0.015)'};
  opacity: ${({ $future }) => ($future ? 0.42 : 1)};
`;

const EmptyDayLabel = styled.Text<{ $today: boolean; $future: boolean }>`
  font-family: ${({ $today }) =>
    $today ? 'Pretendard-SemiBold' : 'Pretendard-Regular'};
  font-size: 10px;
  color: ${({ $today, $future }) => {
    if ($today) {
      return '#d9c4a0';
    }
    if ($future) {
      return '#5e5348';
    }
    return '#7a6f63';
  }};
`;

const BottomBlock = styled.View`
  margin-top: 12px;
  gap: 10px;
  align-items: center;
`;

const FilmStrip = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 52px;
  width: 100%;
`;

const StripPosterWrap = styled.View<{ $index: number; $total: number }>`
  width: 34px;
  height: 50px;
  margin-left: ${({ $index }) => ($index === 0 ? 0 : -10)}px;
  border-radius: 6px;
  overflow: hidden;
  border-width: 1.5px;
  border-color: rgba(184, 149, 107, 0.45);
  background-color: #0e0c0a;
  z-index: ${({ $index, $total }) => $total - $index};
  transform: rotate(
    ${({ $index }) => {
      if ($index === 0) {
        return '-7deg';
      }
      if ($index === 1) {
        return '-3deg';
      }
      if ($index === 2) {
        return '0deg';
      }
      if ($index === 3) {
        return '3deg';
      }
      return '7deg';
    }}
  );
  elevation: ${({ $index }) => 4 + $index};
`;

const StripPoster = styled(FastImage)`
  width: 100%;
  height: 100%;
`;

const FooterRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const FooterDot = styled.View`
  width: 3px;
  height: 3px;
  border-radius: 999px;
  background-color: rgba(184, 149, 107, 0.55);
`;

const FooterTagline = styled.Text`
  font-family: GowunBatang-Regular;
  font-size: 11px;
  color: rgba(184, 149, 107, 0.78);
  letter-spacing: 0.2px;
`;

const FooterMonth = styled.Text`
  font-family: Pretendard-Regular;
  font-size: 9px;
  letter-spacing: 2px;
  color: rgba(122, 111, 99, 0.72);
  text-transform: uppercase;
`;
