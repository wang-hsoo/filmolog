import { useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { theme } from '../../../theme';

import {
  addMonths,
  buildCalendarCells,
  formatWatchedDateLabel,
  isSameDay,
  isSameMonth,
  startOfDay,
} from '../utils/date';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

type WatchedDateCalendarProps = {
  visible: boolean;
  value: Date;
  maxDate: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
};

function WatchedDateCalendar({
  visible,
  value,
  maxDate,
  onClose,
  onSelect,
}: WatchedDateCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfDay(new Date(value.getFullYear(), value.getMonth(), 1)),
  );

  useEffect(() => {
    if (visible) {
      setVisibleMonth(
        startOfDay(new Date(value.getFullYear(), value.getMonth(), 1)),
      );
    }
  }, [value, visible]);

  const cells = useMemo(
    () => buildCalendarCells(visibleMonth, maxDate),
    [maxDate, visibleMonth],
  );

  const canGoNextMonth = !isSameMonth(visibleMonth, maxDate);

  const handleSelect = (date: Date) => {
    onSelect(date);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <ModalRoot>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <Sheet>
          <SheetHeader>
            <MonthShiftButton
              onPress={() => setVisibleMonth(prev => addMonths(prev, -1))}>
              <Icon
                name="chevron-left"
                size={22}
                color={theme.colors.dashboardIcon}
              />
            </MonthShiftButton>

            <SheetTitle>
              {visibleMonth.getFullYear()}년 {visibleMonth.getMonth() + 1}월
            </SheetTitle>

            <MonthShiftButton
              onPress={() => {
                if (canGoNextMonth) {
                  setVisibleMonth(prev => addMonths(prev, 1));
                }
              }}
              disabled={!canGoNextMonth}>
              <Icon
                name="chevron-right"
                size={22}
                color={
                  canGoNextMonth
                    ? theme.colors.dashboardIcon
                    : theme.colors.goldDim
                }
              />
            </MonthShiftButton>
          </SheetHeader>

          <WeekdayRow>
            {WEEKDAY_LABELS.map(label => (
              <WeekdayLabel key={label}>{label}</WeekdayLabel>
            ))}
          </WeekdayRow>

          <CalendarGrid>
            {cells.map(cell =>
              cell.date ? (
                <DayCell key={cell.key}>
                  <DayButton
                    onPress={() => handleSelect(cell.date!)}
                    $selected={isSameDay(cell.date, value)}
                    $today={isSameDay(cell.date, maxDate)}>
                    <DayLabel
                      $selected={isSameDay(cell.date, value)}
                      $today={isSameDay(cell.date, maxDate)}
                      style={
                        Platform.OS === 'android'
                          ? { includeFontPadding: false }
                          : undefined
                      }>
                      {cell.date.getDate()}
                    </DayLabel>
                  </DayButton>
                </DayCell>
              ) : (
                <DayPlaceholder key={cell.key} />
              ),
            )}
          </CalendarGrid>

          <SelectedHint>
            선택일: {formatWatchedDateLabel(value)}
          </SelectedHint>
        </Sheet>
      </ModalRoot>
    </Modal>
  );
}

export default WatchedDateCalendar;

const ModalRoot = styled.View`
  flex: 1;
  justify-content: center;
  padding: 24px 20px;
  background-color: rgba(0, 0, 0, 0.72);
`;

const Sheet = styled.View`
  border-radius: ${({ theme }) => theme.radii.panel}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  padding: 16px;
`;

const SheetHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`;

const MonthShiftButton = styled(Pressable)`
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
`;

const SheetTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 18px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const WeekdayRow = styled.View`
  flex-direction: row;
  margin-bottom: 8px;
`;

const WeekdayLabel = styled.Text`
  flex: 1;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const CalendarGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

const DAY_CIRCLE_SIZE = 36;

const DayCell = styled.View`
  width: 14.2857%;
  aspect-ratio: 1;
  align-items: center;
  justify-content: center;
`;

const DayButton = styled(Pressable)<{ $selected: boolean; $today: boolean }>`
  width: ${DAY_CIRCLE_SIZE}px;
  height: ${DAY_CIRCLE_SIZE}px;
  align-items: center;
  justify-content: center;
  border-radius: ${DAY_CIRCLE_SIZE / 2}px;
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : 'transparent'};
  border-width: ${({ $today, $selected }) =>
    $today && !$selected ? 1 : 0}px;
  border-color: ${({ theme }) => theme.colors.primaryMuted};
`;

const DayPlaceholder = styled.View`
  width: 14.2857%;
  aspect-ratio: 1;
`;

const DayLabel = styled.Text<{ $selected: boolean; $today: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodyMedium};
  font-size: 14px;
  line-height: 14px;
  text-align: center;
  color: ${({ theme, $selected, $today }) => {
    if ($selected) {
      return theme.colors.appBackground;
    }
    if ($today) {
      return theme.colors.goldBright;
    }
    return theme.colors.goldSoft;
  }};
`;

const SelectedHint = styled.Text`
  margin-top: 12px;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;
