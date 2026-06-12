import styled from 'styled-components/native';

import { ArchiveEmptyText } from '../../../components';
import { formatRating } from '../../filmLog/utils/rating';

import type { GenreRatingStat } from '../utils/reviewStats';

type StatisticsGenreRatingProps = {
  items: GenreRatingStat[];
  emptyMessage?: string;
};

function StatisticsGenreRating({
  items,
  emptyMessage = '표시할 데이터가 없습니다.',
}: StatisticsGenreRatingProps) {
  if (items.length === 0) {
    return <ArchiveEmptyText>{emptyMessage}</ArchiveEmptyText>;
  }

  return (
    <RankRoot>
      {items.map((item, index) => {
        const widthPct = Math.max((item.avgRating / 5) * 100, 8);

        return (
          <RankRow key={item.genreId}>
            <RankIndex>{index + 1}</RankIndex>
            <RankBody>
              <RankHeader>
                <RankName numberOfLines={1}>{item.label}</RankName>
                <RankMeta>
                  {formatRating(item.avgRating)} · {item.count}편
                </RankMeta>
              </RankHeader>
              <RankTrack>
                <RankFill style={{ width: `${widthPct}%` }} />
              </RankTrack>
            </RankBody>
          </RankRow>
        );
      })}
    </RankRoot>
  );
}

export default StatisticsGenreRating;

const RankRoot = styled.View`
  gap: 10px;
`;

const RankRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
`;

const RankIndex = styled.Text`
  width: 18px;
  margin-top: 2px;
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
`;

const RankBody = styled.View`
  flex: 1;
  gap: 6px;
`;

const RankHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const RankName = styled.Text`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const RankMeta = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const RankTrack = styled.View`
  height: 6px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  overflow: hidden;
`;

const RankFill = styled.View`
  height: 100%;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.primary};
`;
