// services/songService.ts
import { Paths, File } from 'expo-file-system';
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

    // Create file in document directory
    const file = new File(Paths.document, fileName);
    const fileUri = file.uri;

    console.log(`Downloading to: ${fileUri}`);

    // Download the file using fetch and write to file
    const response = await fetch(song.previewUrl);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Write the file
    await file.create();
    const stream = await file.writableStream();
    const writer = stream.getWriter();
    await writer.write(uint8Array);
    await writer.close();

    console.log(`File downloaded to: ${fileUri}`);

    // Save to media library (Music folder)
    const asset = await MediaLibrary.createAssetAsync(fileUri);
    console.log(`Saved to media library: ${asset.uri}`);

    // Optionally create/get an album and add the asset to it
    const album = await MediaLibrary.getAlbumAsync('Downloaded Music');
    if (album) {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    } else {
      await MediaLibrary.createAlbumAsync('Downloaded Music', asset, false);
    }

    console.log(`Successfully downloaded: ${song.title}`);
    console.log(`File saved to Music/Downloaded Music folder`);

  } catch (error) {
    console.error('Error downloading song:', error);
    throw error;
  }
};
