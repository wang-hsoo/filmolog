import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

import { RootStackParamList } from '../../../app/navigation/types';
import {
  ArchiveEmptyText,
  COLLECTION_THEMES,
  Header,
} from '../../../components';
import { useAuth } from '../../../lib/supabase';
import {
  useGetCollectionListItems,
  type CollectionListItem,
} from '../../../lib/supabase/collection';
import { AppScreen, theme } from '../../../theme';

const H_PAD = 20;
const GRID_GAP = 12;

type CollectionSortKey =
  | 'latest'
  | 'oldest'
  | 'nameAsc'
  | 'moviesDesc'
  | 'moviesAsc';

const SORT_I18N: Record<CollectionSortKey, string> = {
  latest: 'common.sort.latest',
  oldest: 'common.sort.oldest',
  nameAsc: 'common.sort.nameAsc',
  moviesDesc: 'common.sort.moviesDesc',
  moviesAsc: 'common.sort.moviesAsc',
};

function getSortOptions(t: ReturnType<typeof useTranslation>['t']) {
  return (Object.keys(SORT_I18N) as CollectionSortKey[]).map(key => ({
    key,
    label: t(SORT_I18N[key]),
  }));
}

function getTheme(themeId: string) {
  return (
    COLLECTION_THEMES.find(item => item.themeId === themeId) ??
    COLLECTION_THEMES[0]
  );
}

function sortCollections(
  items: CollectionListItem[],
  sortKey: CollectionSortKey,
): CollectionListItem[] {
  const sorted = [...items];

  switch (sortKey) {
    case 'latest':
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    case 'oldest':
      return sorted.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    case 'nameAsc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    case 'moviesDesc':
      return sorted.sort(
        (a, b) =>
          b.movieCount - a.movieCount ||
          a.name.localeCompare(b.name, 'ko'),
      );
    case 'moviesAsc':
      return sorted.sort(
        (a, b) =>
          a.movieCount - b.movieCount ||
          a.name.localeCompare(b.name, 'ko'),
      );
    default:
      return sorted;
  }
}

function CollectionCard({
  item,
  onPress,
}: {
  item: CollectionListItem;
  onPress?: () => void;
}) {
  const { t } = useTranslation();
  const collectionTheme = getTheme(item.theme_id);
  const countLabel = t('common.units.movieCount', { count: item.movieCount });
  const latestLabel = item.latestMovieTitle
    ? t('common.archive.recentlyAdded', { title: item.latestMovieTitle })
    : null;

  return (
    <GridCard onPress={onPress}>
      <GridImage
        source={collectionTheme.bgImage}
        resizeMode="cover"
        imageStyle={{ borderRadius: 12 }}>
        <GridTint $color={collectionTheme.baseColor} />
        <GridBody>
          <GridTop>
            <GridTitle numberOfLines={2}>{item.name}</GridTitle>
            <GridCount>{countLabel}</GridCount>
          </GridTop>
          <GridIconWrap>
            <GridIcon source={collectionTheme.icon} />
          </GridIconWrap>
          <GridBottom>
            {latestLabel ? (
              <GridLatest numberOfLines={1}>{latestLabel}</GridLatest>
            ) : null}
          </GridBottom>
        </GridBody>
      </GridImage>
    </GridCard>
  );
}

function CollectionListScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [sortKey, setSortKey] = useState<CollectionSortKey>('latest');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const { data: collections = [], isLoading } = useGetCollectionListItems(
    user?.id ?? '',
  );

  const sortOptions = useMemo(() => getSortOptions(t), [t]);

  const sortedCollections = useMemo(
    () => sortCollections(collections, sortKey),
    [collections, sortKey],
  );

  const activeSortLabel =
    sortOptions.find(option => option.key === sortKey)?.label ??
    t('common.sort.latest');

  const handleCreateCollection = useCallback(() => {
    navigation.navigate('Collection');
  }, [navigation]);

  const handlePressCollection = useCallback(
    (collectionId: string) => {
      navigation.navigate('CollectionDetail', { collectionId });
    },
    [navigation],
  );

  const handleSelectSort = useCallback((key: CollectionSortKey) => {
    setSortKey(key);
    setIsSortOpen(false);
  }, []);

  return (
    <AppScreen style={{ paddingTop: insets.top }}>
      <Header subtitle="MY COLLECTIONS" navigation={navigation} hideRight />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 24,
          flexGrow: 1,
        }}>
        <ToolbarRow>
          <ToolbarTitle>{t('collection.list.title')}</ToolbarTitle>
          <SortTrigger onPress={() => setIsSortOpen(true)}>
            <SortLabel>
              {t('common.sort.sortPrefix', { label: activeSortLabel })}
            </SortLabel>
            <Icon
              name="chevron-down"
              size={16}
              color={theme.colors.dashboardText}
            />
          </SortTrigger>
        </ToolbarRow>

        {isLoading ? (
          <LoadingState>
            <ActivityIndicator color={theme.colors.primary} size="large" />
          </LoadingState>
        ) : sortedCollections.length === 0 ? (
          <EmptyState>
            <ArchiveEmptyText>{t('collection.list.empty')}</ArchiveEmptyText>
          </EmptyState>
        ) : (
          <ListContent>
            <Grid>
              {sortedCollections.map(item => (
                <GridItem key={item.id}>
                  <CollectionCard
                    item={item}
                    onPress={() => handlePressCollection(item.id)}
                  />
                </GridItem>
              ))}
            </Grid>
          </ListContent>
        )}

        <CreateButton onPress={handleCreateCollection}>
          <Icon name="plus" size={18} color={theme.colors.primary} />
          <CreateLabel>{t('collection.list.createNew')}</CreateLabel>
        </CreateButton>
      </ScrollView>

      <Modal
        transparent
        visible={isSortOpen}
        animationType="fade"
        onRequestClose={() => setIsSortOpen(false)}>
        <SortModalRoot>
          <SortBackdrop onPress={() => setIsSortOpen(false)} />
          <SortMenu style={{ top: insets.top + 96, right: H_PAD }}>
            {sortOptions.map((option, index) => {
              const isActive = option.key === sortKey;
              const isLast = index === sortOptions.length - 1;

              return (
                <SortOption
                  key={option.key}
                  $isLast={isLast}
                  onPress={() => handleSelectSort(option.key)}>
                  <SortOptionLabel $active={isActive}>
                    {option.label}
                  </SortOptionLabel>
                  {isActive ? (
                    <Icon
                      name="check"
                      size={16}
                      color={theme.colors.primary}
                    />
                  ) : null}
                </SortOption>
              );
            })}
          </SortMenu>
        </SortModalRoot>
      </Modal>
    </AppScreen>
  );
}

export default CollectionListScreen;

const ToolbarRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 8px ${H_PAD}px 16px;
`;

const ToolbarTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 17px;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.colors.headerTitle};
`;

const SortTrigger = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  gap: 2px;
  padding: 4px 0 4px 8px;
`;

const SortLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.dashboardText};
`;

const SortModalRoot = styled.View`
  flex: 1;
`;

const SortBackdrop = styled(Pressable)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.45);
`;

const SortMenu = styled.View`
  position: absolute;
  min-width: 148px;
  border-radius: 10px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  overflow: hidden;
`;

const SortOption = styled(Pressable)<{ $isLast: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom-width: ${({ $isLast }) => ($isLast ? 0 : 1)}px;
  border-bottom-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
`;

const SortOptionLabel = styled.Text<{ $active: boolean }>`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 13px;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.dashboardText};
`;

const LoadingState = styled.View`
  min-height: 240px;
  align-items: center;
  justify-content: center;
`;

const EmptyState = styled.View`
  padding: 24px ${H_PAD}px 8px;
`;

const ListContent = styled.View`
  padding: 0 ${H_PAD}px;
`;

const Grid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  row-gap: ${GRID_GAP}px;
`;

const GridItem = styled.View`
  width: 47%;
`;

const GridCard = styled(Pressable)`
  aspect-ratio: 0.78;
  border-radius: 14px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
`;

const GridImage = styled(ImageBackground)`
  flex: 1;
  padding: 14px 12px 12px;
`;

const GridBody = styled.View`
  flex: 1;
  justify-content: space-between;
`;

const GridTint = styled.View<{ $color: string }>`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: ${({ $color }) => `${$color}D9`};
`;

const GridTop = styled.View`
  gap: 4px;
`;

const GridTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: 15px;
  line-height: 20px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.whiteText};
`;

const GridCount = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.primaryMuted};
`;

const GridIconWrap = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
`;

const GridBottom = styled.View`
  min-height: 14px;
`;

const GridLatest = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyLight};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.goldBright};
`;

const GridIcon = styled(Image)`
  width: 60px;
  height: 60px;
  opacity: 0.92;
`;

const CreateButton = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 20px ${H_PAD}px 0;
  padding: 14px 16px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.dashborderBorderAccent};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
`;

const CreateLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 14px;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.colors.primary};
`;
