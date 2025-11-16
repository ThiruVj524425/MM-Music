// services/songService.ts
import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { CustomAPIResponse, Song } from '../types';
import { API_CONFIG, getApiUrl } from './apiConfig';

// Mock data as fallback (your original mock preserved)
const MOCK_SONGS: Song[] = [
  {
    id: 1,
    title: 'Tum Hi Ho',
    artist: 'Arijit Singh',
    thumbnail: 'https://via.placeholder.com/100',
    album: 'Aashiqui 2',
    duration: 262000,
    price: 1.29,
    previewUrl: 'https://example.com/preview1.mp3',
    releaseDate: '2013-04-08T07:00:00Z',
    genre: 'Bollywood',
  },
  {
    id: 2,
    title: 'Channa Mereya',
    artist: 'Arijit Singh',
    thumbnail: 'https://via.placeholder.com/100',
    album: 'Ae Dil Hai Mushkil',
    duration: 298000,
    price: 1.29,
    previewUrl: 'https://example.com/preview2.mp3',
    releaseDate: '2016-10-28T07:00:00Z',
    genre: 'Bollywood',
  },
  {
    id: 3,
    title: 'Kal Ho Naa Ho',
    artist: 'Arijit Singh',
    thumbnail: 'https://via.placeholder.com/100',
    album: 'Kal Ho Naa Ho',
    duration: 324000,
    price: 1.29,
    previewUrl: 'https://example.com/preview3.mp3',
    releaseDate: '2003-11-28T07:00:00Z',
    genre: 'Bollywood',
  }
];


export interface FetchSongsResult {
  songs: Song[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

export const fetchSongs = async (
  page: number = 1,
  limit: number = API_CONFIG.DEFAULT_LIMIT
): Promise<FetchSongsResult> => {
  try {
    const baseUrl = getApiUrl();
    const apiUrl = `${baseUrl}${API_CONFIG.ENDPOINTS.SONGS}?page=${page}&limit=${limit}`;

    console.log(`Fetching from custom API: ${apiUrl}`);
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API HTTP error! status: ${response.status}`);
    }

    const data: CustomAPIResponse = await response.json();
    console.log('API Response:', data);

    // Check if we got valid results
    if (data.success && data.data && data.data.length > 0) {
      console.log(`API: fetched ${data.data.length} songs (page ${data.page} of ${data.totalPages})`);
      console.log(`Total songs available: ${data.total}`);

      return {
        songs: data.data,
        total: data.total,
        totalPages: data.totalPages,
        currentPage: data.page,
        hasMore: data.page < data.totalPages,
      };
    } else {
      // No results from API
      console.warn(`API: no results returned`);

      // On first page failure return mock data
      if (page === 1) {
        console.log('Using mock data as fallback');
        return {
          songs: MOCK_SONGS.slice(0, limit),
          total: MOCK_SONGS.length,
          totalPages: 1,
          currentPage: 1,
          hasMore: false,
        };
      }

      return {
        songs: [],
        total: 0,
        totalPages: 0,
        currentPage: page,
        hasMore: false,
      };
    }
  } catch (error) {
    console.error('Error fetching songs from custom API:', error);

    // On first page failure return mock data
    if (page === 1) {
      console.log('Using mock data as fallback due to error');
      return {
        songs: MOCK_SONGS.slice(0, limit),
        total: MOCK_SONGS.length,
        totalPages: 1,
        currentPage: 1,
        hasMore: false,
      };
    }

    return {
      songs: [],
      total: 0,
      totalPages: 0,
      currentPage: page,
      hasMore: false,
    };
  }
};

export const downloadSong = async (song: Song): Promise<void> => {
  try {
    console.log(`Starting download: ${song.title} by ${song.artist}`);
    console.log(`Download URL: ${song.previewUrl}`);

    // Check if previewUrl is available
    if (!song.previewUrl || song.previewUrl === '') {
      throw new Error('Download URL not available for this song.');
    }

    // Request permission to access media library
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status !== 'granted') {
      throw new Error('Storage permission not granted');
    }

    console.log('Storage permission granted');

    // Create a safe filename
    const fileName = `${song.title.replace(/[^a-z0-9]/gi, '_')}_${song.artist.replace(/[^a-z0-9]/gi, '_')}.mp3`;

    // Create file in cache directory using new File API
    const file = new File(Paths.cache, fileName);

    console.log(`Downloading to: ${file.uri}`);

    // Download the file using fetch with base64 encoding for React Native compatibility
    const response = await fetch(song.previewUrl);
    if (!response.ok) {
      throw new Error(`Download failed with status: ${response.status}`);
    }

    console.log('Download response received, converting to base64...');

    // Convert response to blob, then to base64
    const blob = await response.blob();

    // Convert blob to base64 using FileReader
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/mpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    console.log('Writing base64 data to file...');

    // Try to delete the file if it exists (ignore error if it doesn't)
    try {
      await file.delete();
      console.log('Deleted existing file');
    } catch (error) {
      // File doesn't exist, which is fine
      console.log('No existing file to delete');
    }

    // Write the base64 data to file
    await file.create();
    await file.write(base64Data, { encoding: 'base64' });

    console.log(`File downloaded to: ${file.uri}`);

    // Save to media library
    const asset = await MediaLibrary.createAssetAsync(file.uri);
    console.log(`Saved to media library: ${asset.uri}`);
    console.log(`Asset media type: ${asset.mediaType}`);

    console.log(`Successfully downloaded: ${song.title}`);
    console.log(`File saved to device music library`);

    // Note: Album creation for audio files is not fully supported on all Android versions
    // The file is already saved to the Music folder and accessible via any music player

    // Clean up the cache file after saving to media library
    try {
      await file.delete();
      console.log(`Cleaned up cache file: ${file.uri}`);
    } catch (cleanupError) {
      console.warn('Failed to cleanup cache file:', cleanupError);
    }

  } catch (error) {
    console.error('Error downloading song:', error);
    throw error;
  }
};
