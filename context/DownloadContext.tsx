import React, { createContext, useCallback, useContext, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { DownloadState, DownloadStatus, Song } from '../types';
import { downloadSong } from '../services/songService';

interface DownloadContextType {
  downloadStates: DownloadState;
  downloadSongById: (song: Song) => Promise<void>;
  getDownloadStatus: (songId: number) => DownloadStatus;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [downloadStates, setDownloadStates] = useState<DownloadState>({});

  const downloadSongById = useCallback(async (song: Song) => {
    const songId = song.id;

    // Don't download if already completed
    if (downloadStates[songId] === 'completed') {
      return;
    }

    // Check permissions before downloading (except on web)
    if (Platform.OS !== 'web') {
      const { status } = await MediaLibrary.getPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Storage permission is required to download songs. Please grant permission in your device settings.'
        );
        // Set error state
        setDownloadStates((prev) => ({
          ...prev,
          [songId]: 'error',
        }));
        return;
      }
    }

    // Set downloading state
    setDownloadStates((prev) => ({
      ...prev,
      [songId]: 'downloading',
    }));

    try {
      await downloadSong(song);

      // Set completed state
      setDownloadStates((prev) => ({
        ...prev,
        [songId]: 'completed',
      }));

      // Show success message
      Alert.alert(
        'Download Complete',
        `"${song.title}" has been downloaded successfully!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Download error:', error);

      // Show error message
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert(
        'Download Failed',
        `Failed to download "${song.title}": ${errorMessage}`,
        [{ text: 'OK' }]
      );

      // Set error state
      setDownloadStates((prev) => ({
        ...prev,
        [songId]: 'error',
      }));
    }
  }, [downloadStates]);

  const getDownloadStatus = useCallback(
    (songId: number): DownloadStatus => {
      return downloadStates[songId] || 'idle';
    },
    [downloadStates]
  );

  return (
    <DownloadContext.Provider value={{ downloadStates, downloadSongById, getDownloadStatus }}>
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownload = () => {
  const context = useContext(DownloadContext);
  if (context === undefined) {
    throw new Error('useDownload must be used within a DownloadProvider');
  }
  return context;
};
