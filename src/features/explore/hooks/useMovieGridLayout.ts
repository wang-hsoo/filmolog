import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

const HORIZONTAL_PADDING = 20;
const GRID_GAP = 18;
const MIN_ITEM_WIDTH = 100;
const MAX_COLUMNS = 3;
const POSTER_ASPECT_RATIO = 165 / 110;
const TITLE_BLOCK_HEIGHT = 10 + 38;
const POSTER_MAT_INSET = 6;

type MovieGridLayoutOptions = {
  panelPadding?: number;
};

export function useMovieGridLayout(options: MovieGridLayoutOptions = {}) {
  const { panelPadding = 0 } = options;
  const { width: screenWidth } = useWindowDimensions();

  return useMemo(() => {
    const contentWidth =
      screenWidth - HORIZONTAL_PADDING * 2 - panelPadding * 2;
    const numColumns = Math.max(
      2,
      Math.min(
        MAX_COLUMNS,
        Math.floor((contentWidth + GRID_GAP) / (MIN_ITEM_WIDTH + GRID_GAP)),
      ),
    );
    const columnWidth =
      (contentWidth - GRID_GAP * (numColumns - 1)) / numColumns;
    const itemWidth = columnWidth - POSTER_MAT_INSET;
    const itemHeight =
      itemWidth * POSTER_ASPECT_RATIO +
      POSTER_MAT_INSET +
      TITLE_BLOCK_HEIGHT;

    return {
      numColumns,
      itemWidth,
      itemHeight,
      contentWidth,
      gridGap: GRID_GAP,
      horizontalPadding: HORIZONTAL_PADDING,
    };
  }, [panelPadding, screenWidth]);
}
