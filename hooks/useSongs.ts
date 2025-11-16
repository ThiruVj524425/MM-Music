import { useState, useEffect, useCallback } from 'react';
import { Song } from '../types';
import { fetchSongs } from '../services/songService';

interface UseSongsResult {
  songs: Song[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  loadMore: () => void;
  hasMore: boolean;
  loadingMore: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

export const useSongs = (): UseSongsResult => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadSongs = async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
        console.log(`Loading more songs - page: ${page}`);
      } else {
        setLoading(true);
        console.log('Loading initial songs');
      }
      setError(null);

      const result = await fetchSongs(page, PAGE_SIZE);
      console.log(`Received ${result.songs.length} songs from page ${result.currentPage} of ${result.totalPages}`);
      console.log(`Total songs in database: ${result.total}`);

      // Update pagination metadata
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
      setHasMore(result.hasMore);

      if (append) {
        // Only append unique songs (avoid duplicates)
        setSongs(prevSongs => {
          const newSongs = result.songs.filter(song => !prevSongs.some(s => s.id === song.id));
          console.log(`Adding ${newSongs.length} new unique songs`);
          return [...prevSongs, ...newSongs];
        });
      } else {
        setSongs(result.songs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch songs');
      console.error('Error loading songs:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = useCallback(() => {
    console.log(`loadMore called - hasMore: ${hasMore}, loadingMore: ${loadingMore}, currentPage: ${currentPage}`);
    if (!loadingMore && hasMore) {
      const nextPage = currentPage + 1;
      console.log(`Loading page ${nextPage}`);
      loadSongs(nextPage, true);
    }
  }, [currentPage, loadingMore, hasMore]);

  const refetch = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
    loadSongs(1, false);
  }, []);

  useEffect(() => {
    loadSongs(1, false);
  }, []);

  return {
    songs,
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
    loadingMore,
    total,
    currentPage,
    totalPages,
  };
};
