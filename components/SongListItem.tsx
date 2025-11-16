import { useTheme } from '@/theme/ThemeProvider';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DownloadStatus, Song } from '../types';
import { Button } from './Button';

export type ViewMode = 'card' | 'list';

interface SongListItemProps {
  song: Song;
  onPress: () => void;
  onDownload: () => void;
  downloadStatus: DownloadStatus;
  viewMode?: ViewMode;
  downloadDisabled?: boolean;
}

export const SongListItem: React.FC<SongListItemProps> = ({
  song,
  onPress,
  onDownload,
  downloadStatus,
  viewMode = 'card',
  downloadDisabled = false,
}) => {
  const { theme } = useTheme();
  const isListView = viewMode === 'list';

  const getDownloadButtonTitle = () => {
    if (downloadDisabled) {
      return 'No Permission';
    }

    switch (downloadStatus) {
      case 'downloading':
        return 'Downloading...';
      case 'completed':
        return 'Downloaded';
      case 'error':
        return 'Retry';
      default:
        return 'Download';
    }
  };

  const getDownloadButtonVariant = (): 'primary' | 'secondary' | 'success' => {
    return downloadStatus === 'completed' ? 'success' : 'primary';
  };

  const containerStyle = isListView
    ? [
        styles.listContainer,
        {
          backgroundColor: theme.colors.card,
          borderBottomColor: theme.colors.border,
        },
      ]
    : [
        styles.cardContainer,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: song.thumbnail }}
        style={styles.thumbnail}
      />
      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={[styles.artist, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {song.artist}
        </Text>
      </View>
      <Button
        title={getDownloadButtonTitle()}
        onPress={onDownload}
        variant={getDownloadButtonVariant()}
        disabled={downloadStatus === 'completed' || downloadDisabled}
        loading={downloadStatus === 'downloading'}
        style={styles.downloadButton}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Card view style (elevated with border and margin)
  cardContainer: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  // List view style (flat with border bottom only)
  listContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
  },
  downloadButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
});
