import GridViewIcon from '@/assets/GridViewIcon';
import ListViewIcon from '@/assets/ListViewIcon';
import MoonIcon from '@/assets/MoonIcon';
import SunIcon from '@/assets/SunIcon';
import { ErrorView } from '@/components/ErrorView';
import { Loading } from '@/components/Loading';
import { SongListItem, ViewMode } from '@/components/SongListItem';
import { useDownload } from '@/hooks/useDownload';
import { usePermissions } from '@/hooks/usePermissions';
import { useSongs } from '@/hooks/useSongs';
import { useTheme } from '@/theme/ThemeProvider';
import { RootStackParamList, Song } from '@/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


interface SongListScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SongList'>;
}

export const SongListScreen: React.FC<SongListScreenProps> = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { hasPermission, requestPermission, isLoading: permissionsLoading } = usePermissions();

  // Fetches songs from custom API with pagination
  const {
    songs,
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
    loadingMore,
    total,
    currentPage,
    totalPages
  } = useSongs();
  const { downloadSongById, getDownloadStatus } = useDownload();

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'card' ? 'list' : 'card');
  };

  const handleSongPress = (song: Song) => {
    navigation.navigate('SongDetails', { song });
  };

  const handleDownload = async (song: Song) => {
    // Check if we have permission first
    if (!hasPermission) {
      Alert.alert(
        'Storage Permission Required',
        'This app needs storage permission to download songs. Would you like to grant permission?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Grant Permission',
            onPress: async () => {
              const granted = await requestPermission();
              if (granted) {
                await downloadSongById(song);
              } else {
                Alert.alert(
                  'Permission Denied',
                  'Storage permission is required to download songs. Please enable it in your device settings.'
                );
              }
            },
          },
        ]
      );
      return;
    }

    // your useDownload hook handles download logic
    await downloadSongById(song);
  };

  const handleEndReached = () => {
    console.log(`handleEndReached - Page ${currentPage}/${totalPages}, hasMore: ${hasMore}, loadingMore: ${loadingMore}, songs: ${songs.length}/${total}`);
    if (hasMore && !loadingMore) {
      loadMore();
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <Loading message="Loading more songs..." />
      </View>
    );
  };

  if (loading) {
    return <Loading message="Loading songs..." />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={refetch} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Music Library</Text>
          {total > 0 && (
            <Text style={[styles.headerSubtitle, { color: theme.colors.text, opacity: 0.6 }]}>
              {songs.length} of {total} songs
            </Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggleViewMode} style={styles.iconButton}>
            {viewMode === 'card' ? (
              <ListViewIcon size={22} color={theme.colors.text} />
            ) : (
              <GridViewIcon size={22} color={theme.colors.text} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
            {isDark ? <SunIcon stroke={'#FFF'} /> : <MoonIcon />}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={songs}
        keyExtractor={(item, i) => item.id.toString() + i}
        renderItem={({ item }) => (
          <SongListItem
            song={item}
            onPress={() => handleSongPress(item)}
            onDownload={() => handleDownload(item)}
            downloadStatus={getDownloadStatus(item.id)}
            viewMode={viewMode}
            downloadDisabled={!hasPermission && !permissionsLoading}
          />
        )}
        contentContainerStyle={viewMode==="list"?{}:styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  listContent: { paddingVertical: 8 },
  footerLoader: { paddingVertical: 20 },
});
