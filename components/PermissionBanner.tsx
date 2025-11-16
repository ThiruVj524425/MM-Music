import { useTheme } from '@/theme/ThemeProvider';
import React from 'react';
import { Alert, Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';

interface PermissionBannerProps {
  onRequestPermission: () => Promise<boolean>;
  permissionStatus: string | null;
}

export const PermissionBanner: React.FC<PermissionBannerProps> = ({
  onRequestPermission,
  permissionStatus,
}) => {
  const { theme } = useTheme();

  const handleEnablePermission = async () => {
    const granted = await onRequestPermission();

    if (!granted && permissionStatus === 'denied') {
      // If permission was denied and user can't be prompted again, guide them to settings
      Alert.alert(
        'Permission Denied',
        'Storage permission was denied. Please enable it in your device settings to download songs.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.warning }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚠️</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.dark ? '#000' : '#000' }]}>
            Storage Permission Required
          </Text>
          <Text style={[styles.message, { color: theme.dark ? '#1a1a1a' : '#333' }]}>
            Enable storage permission to download and save songs to your device.
          </Text>
        </View>
      </View>
      <Button
        title="Enable Permission"
        onPress={handleEnablePermission}
        variant="secondary"
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
  },
});
