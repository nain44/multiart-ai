import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

function fileExtension(imageUrl: string): string {
  const path = imageUrl.split('?')[0];
  const match = path.match(/\.(jpe?g|png|webp|gif)$/i);
  return match ? match[1].toLowerCase() : 'jpg';
}

/**
 * Download a remote image and save it to the device photo gallery.
 */
export async function saveImageToGallery(imageUrl: string, id: string): Promise<void> {
  const { status } = await MediaLibrary.requestPermissionsAsync(true);
  if (status !== 'granted') {
    throw new Error('Gallery permission denied');
  }

  const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!baseDir) {
    throw new Error('No writable storage on device');
  }

  const ext = fileExtension(imageUrl);
  const localPath = `${baseDir}MultiArt AI_${id}.${ext}`;
  const { uri } = await FileSystem.downloadAsync(imageUrl, localPath);
  await MediaLibrary.createAssetAsync(uri);
}
