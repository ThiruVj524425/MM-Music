import { useState, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';

interface UsePermissionsResult {
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  permissionStatus: MediaLibrary.PermissionStatus | null;
  isLoading: boolean;
}

export const usePermissions = (): UsePermissionsResult => {
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<MediaLibrary.PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkPermission = async () => {
    try {
      setIsLoading(true);

      // On web, we don't need storage permissions
      if (Platform.OS === 'web') {
        setHasPermission(true);
        setPermissionStatus('granted');
        setIsLoading(false);
        return;
      }

      const { status } = await MediaLibrary.getPermissionsAsync();
      setPermissionStatus(status);
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Error checking permissions:', error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      // On web, return true immediately
      if (Platform.OS === 'web') {
        return true;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      setPermissionStatus(status);
      const granted = status === 'granted';
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  return {
    hasPermission,
    requestPermission,
    permissionStatus,
    isLoading,
  };
};
