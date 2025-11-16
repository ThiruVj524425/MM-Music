export interface Song {
  id: number;
  title: string;
  artist: string;
  thumbnail: string;
  album: string;
  duration: number;
  price: number;
  previewUrl: string;
  releaseDate: string;
  genre: string;
}

// Custom API Types
export interface CustomAPIResponse {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: Song[];
}

// AudioDB API Types (kept for reference)
export interface AudioDBResponse {
  trending: AudioDBTrack[] | null;
}

export interface AudioDBTrack {
  idTrend: string;
  idArtist: string;
  idAlbum: string;
  idTrack: string;
  strArtistMBID: string | null;
  strAlbumMBID: string | null;
  strTrackMBID: string | null;
  strArtist: string;
  strAlbum: string;
  strTrack: string;
  strArtistThumb: string | null;
  strAlbumThumb: string | null;
  strTrackThumb: string | null;
  strCountry: string;
  strType: string;
  intChartPlace: string;
  intWeek: string;
  dateAdded: string;
}

// Legacy iTunes types (kept for backward compatibility)
export interface iTunesResponse {
  resultCount: number;
  results: iTunesTrack[];
}

export interface iTunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  collectionName: string;
  trackTimeMillis: number;
  trackPrice: number;
  previewUrl: string;
  releaseDate: string;
  primaryGenreName: string;
}

export type DownloadStatus = 'idle' | 'downloading' | 'completed' | 'error';

export interface DownloadState {
  [key: number]: DownloadStatus;
}

export type RootStackParamList = {
  SongList: undefined;
  SongDetails: { song: Song };
};
