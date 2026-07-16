import AsyncStorage from '@react-native-async-storage/async-storage';
import { Wallpaper } from './api';

const FAVORITES_KEY = 'wv_favorites';

export async function getFavorites(): Promise<Wallpaper[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addFavorite(wallpaper: Wallpaper): Promise<void> {
  const favorites = await getFavorites();
  if (!favorites.find((f) => f._id === wallpaper._id)) {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify([wallpaper, ...favorites]));
  }
}

export async function removeFavorite(id: string): Promise<void> {
  const favorites = await getFavorites();
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.filter((f) => f._id !== id)));
}

export async function isFavorite(id: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((f) => f._id === id);
}

export async function toggleFavorite(wallpaper: Wallpaper): Promise<boolean> {
  const fav = await isFavorite(wallpaper._id);
  if (fav) {
    await removeFavorite(wallpaper._id);
    return false;
  } else {
    await addFavorite(wallpaper);
    return true;
  }
}
