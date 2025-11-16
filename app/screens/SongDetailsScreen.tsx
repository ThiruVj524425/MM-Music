import { Button } from '@/components/Button';
import { useDownload } from '@/hooks/useDownload';
import { usePermissions } from '@/hooks/usePermissions';
import { useTheme } from '@/theme/ThemeProvider';
import { RootStackParamList } from '@/types';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


interface SongDetailsScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SongDetails'>;
  route: RouteProp<RootStackParamList, 'SongDetails'>;
}

export const SongDetailsScreen: React.FC<SongDetailsScreenProps> = ({ navigation, route }) => {
  const { song } = route.params;
  const { theme ,isDark} = useTheme();
  const { downloadSongById, getDownloadStatus } = useDownload();
  const { hasPermission, requestPermission, isLoading: permissionsLoading } = usePermissions();

  const downloadStatus = getDownloadStatus(song.id);

  const handleDownload = async () => {
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

    await downloadSongById(song);
  };

  const formatDuration = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getDownloadButtonTitle = () => {
    if (!hasPermission && !permissionsLoading) {
      return 'No Storage Permission';
    }

    switch (downloadStatus) {
      case 'downloading':
        return 'Downloading...';
      case 'completed':
        return 'Downloaded';
      case 'error':
        return 'Retry Download';
      default:
        return 'Download';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton,{
          borderColor:isDark?'#FFF':'#000'
            ,width:50}]}>
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Image
            source={{ uri: song.thumbnail }}
            style={[styles.artwork, { borderColor: theme.colors.border }]}
          />

          <Text style={[styles.title, { color: theme.colors.text }]}>{song.title}</Text>
          <Text style={[styles.artist, { color: theme.colors.textSecondary }]}>{song.artist}</Text>

          <View style={[styles.detailsContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <DetailRow key="album" label="Album" value={song.album} theme={theme} />
            <DetailRow key="genre" label="Genre" value={song.genre} theme={theme} />
            <DetailRow key="duration" label="Duration" value={formatDuration(song.duration)} theme={theme} />
            <DetailRow key="releaseDate" label="Release Date" value={formatDate(song.releaseDate)} theme={theme} />
            {song.price > 0 && (
              <DetailRow key="price" label="Price" value={`$${song.price.toFixed(2)}`} theme={theme} />
            )}
          </View>

          <Button
            title={getDownloadButtonTitle()}
            onPress={handleDownload}
            variant={downloadStatus === 'completed' ? 'success' : 'primary'}
            disabled={downloadStatus === 'completed' || (!hasPermission && !permissionsLoading)}
            loading={downloadStatus === 'downloading' || permissionsLoading}
            style={styles.downloadButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
  theme: any;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, theme }) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    <Text style={[styles.detailValue, { color: theme.colors.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    paddingVertical: 8,
    borderWidth:1,
    borderRadius:10,
    display:'flex',
    alignItems:'center'
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  artwork: {
    width: 250,
    height: 250,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  artist: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 32,
  },
  detailsContainer: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
  },
  downloadButton: {
    width: '100%',
    marginBottom: 32,
  },
});
