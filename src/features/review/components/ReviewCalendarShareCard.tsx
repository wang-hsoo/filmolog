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
    const stripPosters = highlightPosterUris.slice(0, 5);

    return (
      <View
        ref={ref}
        collapsable={false}
        style={{
          width: CALENDAR_SHARE_CARD_WIDTH,
          height: CALENDAR_SHARE_CARD_HEIGHT,
        }}>
        <LinearGradient
          colors={['#17130F', '#0E0C0A', '#060605']}
          locations={[0, 0.55, 1]}
          style={{ flex: 1 }}>
          <CanvasInner>
            <TopRow>
              <BrandMark>FILMOLOG</BrandMark>
              <FilmCountPill>{filmCountLabel}</FilmCountPill>
            </TopRow>

            <TitleBlock>
              <MonthTitle>{monthTitle}</MonthTitle>
              <ProgressRow>
                <ProgressTrack>
                  <ProgressFill $ratio={progressRatio} />
                </ProgressTrack>
                <ProgressLabel>{progressLabel}</ProgressLabel>
              </ProgressRow>
              <CaptionLabel>{captionLabel}</CaptionLabel>
            </TitleBlock>

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

              <FooterRule />
              <FooterTagline>{footerTagline}</FooterTagline>
            </BottomBlock>
          </CanvasInner>
        </LinearGradient>
      </View>
    );
  },
);

ReviewCalendarShareCard.displayName = 'ReviewCalendarShareCard';

export default ReviewCalendarShareCard;

const CanvasInner = styled.View`
  flex: 1;
  padding: 22px 24px 20px;
`;

const TopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`;

const BrandMark = styled.Text`
  font-family: GowunBatang-Bold;
  font-size: 13px;
  letter-spacing: 4px;
  color: #b8956b;
`;

const FilmCountPill = styled.Text`
  padding: 5px 10px;
  border-radius: 999px;
  overflow: hidden;
  font-family: Pretendard-Medium;
  font-size: 11px;
  color: #d9c4a0;
  background-color: rgba(184, 149, 107, 0.12);
  border-width: 1px;
  border-color: #3d3226;
`;

const TitleBlock = styled.View`
  margin-bottom: 12px;
  gap: 8px;
`;

const MonthTitle = styled.Text`
  font-family: GowunBatang-Bold;
  font-size: 28px;
  line-height: 34px;
  color: #f2ebe0;
`;

const ProgressRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const ProgressTrack = styled.View`
  flex: 1;
  height: 5px;
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

const ProgressLabel = styled.Text`
  font-family: Pretendard-Regular;
  font-size: 11px;
  color: #a89b8e;
`;

const CaptionLabel = styled.Text`
  font-family: Pretendard-Regular;
  font-size: 11px;
  line-height: 16px;
  color: #7a6f63;
`;

const CalendarBlock = styled.View`
  flex: 1;
  min-height: 0;
  gap: 6px;
`;

const WeekdayRow = styled.View`
  flex-direction: row;
  margin-bottom: 2px;
  padding: 0 1px;
`;

const WeekdayCell = styled.View`
  flex: 1;
  align-items: center;
`;

const WeekdayLabel = styled.Text`
  font-family: Pretendard-Regular;
  font-size: 10px;
  color: #7a6f63;
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
  border-radius: 8px;
  overflow: hidden;
  border-width: ${({ $hasPoster }) => ($hasPoster ? 1 : 0.5)}px;
  border-color: ${({ $hasPoster }) => ($hasPoster ? '#4a3d30' : '#2a231c')};
`;

const DayPoster = styled(FastImage)`
  width: 100%;
  height: 100%;
`;

const DayShade = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 40%;
  background-color: rgba(0, 0, 0, 0.28);
`;

const DayBadge = styled.View<{ $today: boolean }>`
  position: absolute;
  top: 4px;
  left: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $today }) =>
    $today ? '#b8956b' : 'rgba(8, 8, 7, 0.78)'};
`;

const DayBadgeLabel = styled.Text<{ $today: boolean }>`
  font-family: Pretendard-SemiBold;
  font-size: 10px;
  color: ${({ $today }) => ($today ? '#080807' : '#f2ebe0')};
`;

const CountBadge = styled.View`
  position: absolute;
  right: 4px;
  bottom: 4px;
  min-width: 18px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  background-color: rgba(8, 8, 7, 0.82);
  border-width: 1px;
  border-color: #4a3d30;
`;

const CountBadgeLabel = styled.Text`
  font-family: Pretendard-SemiBold;
  font-size: 9px;
  color: #d9c4a0;
`;

const EmptyDay = styled.View<{ $today: boolean; $future: boolean }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border-width: 1px;
  border-style: dashed;
  border-color: ${({ $today }) => ($today ? '#8a7052' : '#2a231c')};
  background-color: ${({ $today }) =>
    $today ? 'rgba(184, 149, 107, 0.08)' : 'rgba(255, 255, 255, 0.02)'};
  opacity: ${({ $future }) => ($future ? 0.45 : 1)};
`;

const EmptyDayLabel = styled.Text<{ $today: boolean; $future: boolean }>`
  font-family: ${({ $today }) =>
    $today ? 'Pretendard-SemiBold' : 'Pretendard-Regular'};
  font-size: 11px;
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

const FooterRule = styled.View`
  width: 100%;
  height: 1px;
  background-color: #3d3226;
`;

const FooterTagline = styled.Text`
  text-align: center;
  font-family: Pretendard-Regular;
  font-size: 11px;
  color: #8a7052;
`;
