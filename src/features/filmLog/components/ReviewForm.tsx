import { useCallback, useMemo, useState, type RefObject } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import {
  ArchiveEmptyText,
  ArchivePanel,
  ArchiveSectionHeader,
} from '../../../components';
import type { Collection } from '../../../lib/supabase/collection';
import { theme } from '../../../theme';

import WatchedDateCalendar from './WatchedDateCalendar';
import {
  addDays,
  formatWatchedDateLabel,
  isSameDay,
  startOfDay,
} from '../utils/date';
import { formatRating, getStarIconName, STAR_VALUES } from '../utils/rating';

const STAR_SIZE = 36;

export type ReviewFormProps = {
  rating: number;
  onRatingChange: (rating: number) => void;
  content: string;
  onContentChange: (content: string) => void;
  watchedDate: Date;
  onWatchedDateChange: (date: Date) => void;
  collections?: Collection[];
  isCollectionsLoading?: boolean;
  selectedCollectionIds?: string[];
  onToggleCollection?: (collectionId: string) => void;
  onReviewInputFocus?: () => void;
  onReviewInputBlur?: () => void;
  reviewInputWrapRef?: RefObject<View | null>;
};

function ReviewForm({
  rating,
  onRatingChange,
  content,
  onContentChange,
  watchedDate,
  onWatchedDateChange,
  collections,
  isCollectionsLoading = false,
  selectedCollectionIds = [],
  onToggleCollection,
  onReviewInputFocus,
  onReviewInputBlur,
  reviewInputWrapRef,
}: ReviewFormProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const today = useMemo(() => startOfDay(new Date()), []);
  const showCollections = collections != null && onToggleCollection != null;

  const handleShiftWatchedDate = useCallback(
    (days: number) => {
      const nextDate = addDays(watchedDate, days);
      if (nextDate > today) {
        return;
      }
      onWatchedDateChange(nextDate);
    },
    [onWatchedDateChange, today, watchedDate],
  );

  return (
    <>
      <ArchivePanel accent>
        <ArchiveSectionHeader
          overline="WATCHED"
          title="시청일"
          subtitle="언제 이 작품을 보셨나요?"
        />

        <QuickDateRow>
          <QuickDateButton
            $active={isSameDay(watchedDate, today)}
            onPress={() => onWatchedDateChange(today)}>
            <QuickDateLabel $active={isSameDay(watchedDate, today)}>
              오늘
            </QuickDateLabel>
          </QuickDateButton>
          <QuickDateButton
            $active={isSameDay(watchedDate, addDays(today, -1))}
            onPress={() => onWatchedDateChange(addDays(today, -1))}>
            <QuickDateLabel
              $active={isSameDay(watchedDate, addDays(today, -1))}>
              어제
            </QuickDateLabel>
          </QuickDateButton>
        </QuickDateRow>

        <DatePickerRow>
          <DateShiftButton
            onPress={() => handleShiftWatchedDate(-1)}
            accessibilityLabel="하루 전">
            <Icon
              name="chevron-left"
              size={22}
              color={theme.colors.dashboardIcon}
            />
          </DateShiftButton>
          <DateValueButton onPress={() => setIsCalendarOpen(true)}>
            <DateValue>{formatWatchedDateLabel(watchedDate)}</DateValue>
            <Icon
              name="calendar-month-outline"
              size={18}
              color={theme.colors.dashboardIcon}
            />
          </DateValueButton>
          <DateShiftButton
            onPress={() => handleShiftWatchedDate(1)}
            disabled={isSameDay(watchedDate, today)}
            accessibilityLabel="하루 후">
            <Icon
              name="chevron-right"
              size={22}
              color={
                isSameDay(watchedDate, today)
                  ? theme.colors.goldDim
                  : theme.colors.dashboardIcon
              }
            />
          </DateShiftButton>
        </DatePickerRow>
      </ArchivePanel>

      <ArchivePanel accent>
        <ArchiveSectionHeader
          overline="RATING"
          title="평점"
          subtitle="별 왼쪽은 0.5점, 오른쪽은 1점 단위예요."
        />

        <RatingRow>
          {STAR_VALUES.map(star => {
            const isActive = rating >= star - 0.5;
            const iconName = getStarIconName(star, rating);

            return (
              <StarWrap key={star}>
                <StarTapHalf
                  onPress={() => onRatingChange(star - 0.5)}
                  accessibilityLabel={`${star - 0.5}점`}
                />
                <StarTapFull
                  onPress={() => onRatingChange(star)}
                  accessibilityLabel={`${star}점`}
                />
                <Icon
                  name={iconName}
                  size={32}
                  color={
                    isActive ? theme.colors.primary : theme.colors.goldDim
                  }
                />
              </StarWrap>
            );
          })}
        </RatingRow>
        <RatingValue>
          {rating > 0 ? formatRating(rating) : '평점을 선택하세요'}
        </RatingValue>
      </ArchivePanel>

      <ArchivePanel accent>
        <ArchiveSectionHeader
          overline="REVIEW"
          title="한줄평 · 감상"
          subtitle="짧은 메모도 좋아요."
        />

        <View ref={reviewInputWrapRef} collapsable={false}>
          <ReviewInput
            value={content}
            onChangeText={onContentChange}
            onFocus={onReviewInputFocus}
            onBlur={onReviewInputBlur}
            placeholder="이 영화에 대한 생각을 적어보세요."
            placeholderTextColor={theme.colors.placeholderText}
            multiline
            textAlignVertical="top"
            maxLength={1000}
          />
        </View>
      </ArchivePanel>

      {showCollections ? (
        <ArchivePanel accent>
          <ArchiveSectionHeader
            overline="COLLECTION"
            title="컬렉션에 담기"
            subtitle="선택한 컬렉션에 이 작품을 바로 추가해요."
          />

          {isCollectionsLoading ? (
            <CollectionState>
              <ActivityIndicator color={theme.colors.primary} />
            </CollectionState>
          ) : collections.length === 0 ? (
            <ArchiveEmptyText>
              아직 컬렉션이 없습니다. 기록만 저장하거나 컬렉션을 먼저
              만들어주세요.
            </ArchiveEmptyText>
          ) : (
            <CollectionList>
              {collections.map(collection => {
                const isSelected = selectedCollectionIds.includes(
                  collection.id,
                );

                return (
                  <CollectionItem
                    key={collection.id}
                    $selected={isSelected}
                    onPress={() => onToggleCollection(collection.id)}>
                    <Icon
                      name={
                        isSelected
                          ? 'checkbox-marked'
                          : 'checkbox-blank-outline'
                      }
                      size={20}
                      color={
                        isSelected
                          ? theme.colors.primary
                          : theme.colors.goldDim
                      }
                    />
                    <CollectionName>{collection.name}</CollectionName>
                  </CollectionItem>
                );
              })}
            </CollectionList>
          )}
        </ArchivePanel>
      ) : null}

      <WatchedDateCalendar
        visible={isCalendarOpen}
        value={watchedDate}
        maxDate={today}
        onClose={() => setIsCalendarOpen(false)}
        onSelect={onWatchedDateChange}
      />
    </>
  );
}

export default ReviewForm;

const QuickDateRow = styled.View`
  flex-direction: row;
  gap: 8px;
  margin-bottom: 12px;
`;

const QuickDateButton = styled(Pressable)<{ $active: boolean }>`
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.search}px;
  border-width: 1px;
  border-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.dashborderBorderAccent};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceRaised : theme.colors.surface};
`;

const QuickDateLabel = styled.Text<{ $active: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodyMedium};
  font-size: 13px;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.goldBright : theme.colors.dashboardText};
`;

const DatePickerRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const DateShiftButton = styled(Pressable)`
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
`;

const DateValueButton = styled(Pressable)`
  min-width: 148px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.search}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const DateValue = styled.Text`
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 18px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const CollectionState = styled.View`
  min-height: 72px;
  align-items: center;
  justify-content: center;
`;

const CollectionList = styled.View`
  gap: 8px;
`;

const CollectionItem = styled(Pressable)<{ $selected: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radii.search}px;
  border-width: 1px;
  border-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.dashborderBorderAccent};
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.surfaceRaised : theme.colors.surface};
`;

const CollectionName = styled.Text`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.goldSoft};
`;

const RatingRow = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: 6px;
`;

const StarWrap = styled.View`
  width: ${STAR_SIZE}px;
  height: ${STAR_SIZE}px;
  align-items: center;
  justify-content: center;
`;

const StarTapHalf = styled(Pressable)`
  position: absolute;
  left: 0;
  top: 0;
  width: 50%;
  height: 100%;
  z-index: 1;
`;

const StarTapFull = styled(Pressable)`
  position: absolute;
  right: 0;
  top: 0;
  width: 50%;
  height: 100%;
  z-index: 1;
`;

const RatingValue = styled.Text`
  margin-top: 10px;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 18px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const ReviewInput = styled.TextInput`
  min-height: 140px;
  padding: 14px;
  border-radius: ${({ theme }) => theme.radii.search}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.surface};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 15px;
  line-height: 22px;
  color: ${({ theme }) => theme.colors.goldSoft};
`;
