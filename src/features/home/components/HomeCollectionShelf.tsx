import { useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
} from 'react-native';
import styled from 'styled-components/native';

import {
  ArchiveEmptyText,
  ArchivePanel,
  ArchiveSectionHeader,
  COLLECTION_THEMES,
} from '../../../components';
import type { Collection } from '../../../lib/supabase/collection';
import { theme } from '../../../theme';

const SPINE_WIDTH = 76;
const SPINE_HEIGHT = 168;
const HOME_PREVIEW_LIMIT = 8;

type HomeCollectionShelfProps = {
  collections: Collection[];
  isLoading: boolean;
  onViewAll?: () => void;
  onPressCollection?: (collection: Collection) => void;
};

function getTheme(themeId: string) {
  return (
    COLLECTION_THEMES.find(item => item.themeId === themeId) ??
    COLLECTION_THEMES[0]
  );
}

function HomeCollectionShelf({
  collections,
  isLoading,
  onViewAll,
  onPressCollection,
}: HomeCollectionShelfProps) {
  const previewCollections = useMemo(
    () => collections.slice(0, HOME_PREVIEW_LIMIT),
    [collections],
  );

  return (
    <ArchivePanel accent compact>
      <SectionHeaderRow>
        <HeaderFrame>
          <ArchiveSectionHeader
            overline="MY COLLECTION"
            title="나의 컬렉션"
            subtitle="취향대로 묶어둔 아카이브."
          />
        </HeaderFrame>
        {onViewAll ? (
          <ViewAllButton onPress={onViewAll}>
            <ViewAllLabel>모두 보기</ViewAllLabel>
            <ViewAllChevron>›</ViewAllChevron>
          </ViewAllButton>
        ) : null}
      </SectionHeaderRow>

      {isLoading ? (
        <LoadingState>
          <ActivityIndicator color={theme.colors.primary} />
        </LoadingState>
      ) : previewCollections.length === 0 ? (
        <ArchiveEmptyText>
          아직 컬렉션이 없습니다. 첫 아카이브를 만들어보세요.
        </ArchiveEmptyText>
      ) : (
        <ShelfFrame>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 2, paddingBottom: 4 }}>
            {previewCollections.map((collection, index) => {
              const collectionTheme = getTheme(collection.theme_id);

              return (
                <SpinePressable
                  key={collection.id}
                  $isFirst={index === 0}
                  onPress={() => onPressCollection?.(collection)}>
                  <SpineShadow />
                  <SpineCard>
                    <SpineCover
                      source={collectionTheme.bgImage}
                      resizeMode="cover"
                      imageStyle={{ borderRadius: 3 }}>
                      <SpineTint $color={collectionTheme.baseColor} />
                      <SpineEdge />
                      <SpineTitle numberOfLines={4}>
                        {collection.name.toUpperCase()}
                      </SpineTitle>
                      <SpineFooter>
                        <SpineIcon
                          source={collectionTheme.icon}
                          resizeMode="contain"
                        />
                      </SpineFooter>
                    </SpineCover>
                  </SpineCard>
                </SpinePressable>
              );
            })}
          </ScrollView>
          <ShelfBoard />
        </ShelfFrame>
      )}
    </ArchivePanel>
  );
}

export default HomeCollectionShelf;

const SectionHeaderRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
`;

const HeaderFrame = styled.View`
  flex: 1;
  min-width: 0;
`;

const ViewAllButton = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  gap: 2px;
  padding: 4px 0 4px 8px;
`;

const ViewAllLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const ViewAllChevron = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 16px;
  line-height: 16px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const LoadingState = styled.View`
  min-height: ${SPINE_HEIGHT + 18}px;
  align-items: center;
  justify-content: center;
`;

const ShelfFrame = styled.View`
  gap: 10px;
`;

const SpinePressable = styled(Pressable)<{ $isFirst: boolean }>`
  width: ${SPINE_WIDTH}px;
  height: ${SPINE_HEIGHT}px;
  margin-left: ${({ $isFirst }) => ($isFirst ? 0 : 10)}px;
`;

const SpineShadow = styled.View`
  position: absolute;
  left: 4px;
  right: -2px;
  bottom: -3px;
  height: ${SPINE_HEIGHT - 6}px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.45);
`;

const SpineCard = styled.View`
  flex: 1;
  border-radius: 4px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.posterBorder};
`;

const SpineCover = styled(ImageBackground)`
  flex: 1;
  justify-content: space-between;
  padding: 10px 6px 8px;
`;

const SpineTint = styled.View<{ $color: string }>`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: ${({ $color }) => `${$color}CC`};
`;

const SpineEdge = styled.View`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  background-color: rgba(255, 255, 255, 0.08);
`;

const SpineTitle = styled.Text`
  margin-top: 2px;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.6px;
  text-align: center;
  color: ${({ theme }) => theme.colors.whiteText};
`;

const SpineFooter = styled.View`
  align-items: center;
`;

const SpineIcon = styled(Image)`
  width: 22px;
  height: 22px;
  opacity: 0.88;
`;

const ShelfBoard = styled.View`
  height: 1px;
  margin-top: 2px;
  background-color: ${({ theme }) => theme.colors.goldLine};
`;
