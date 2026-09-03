import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { api, Wallpaper } from '@/lib/api';
import { Colors, Radius, Spacing } from '@/constants/Colors';

function statusLabel(wp: Wallpaper): { text: string; color: string } {
  if (wp.visibility === 'public') {
    if (wp.approvalStatus === 'approved') return { text: '🌍 Public', color: Colors.success };
    if (wp.approvalStatus === 'rejected') return { text: '🚫 Rejected', color: Colors.error };
    return { text: '⏳ Pending review', color: Colors.warning };
  }
  return { text: '🔒 Private', color: Colors.textMuted };
}

export default function MyCreationsScreen() {
  const [items, setItems] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.myCreations();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const requestPublic = async (id: string) => {
    setBusyId(id);
    try {
      await api.requestPublic(id);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setBusyId(null);
    }
  };

  const makePrivate = async (id: string) => {
    setBusyId(id);
    try {
      await api.makePrivate(id);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>My Creations</Text>
        <View style={{ width: 50 }} />
      </View>

      {loading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centerFill}>
          <Text style={styles.emptyText}>You haven't generated any wallpapers yet.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
          renderItem={({ item }) => {
            const status = statusLabel(item);
            const busy = busyId === item._id;
            return (
              <View style={styles.card}>
                <Pressable onPress={() => router.push({ pathname: '/wallpaper/[id]', params: { id: item._id } } as any)}>
                  <Image source={{ uri: item.thumbnailUrl }} style={styles.thumb} contentFit="cover" />
                </Pressable>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={[styles.cardStatus, { color: status.color }]}>{status.text}</Text>

                  {item.visibility === 'private' && (
                    <Pressable style={styles.actionBtn} disabled={busy} onPress={() => requestPublic(item._id)}>
                      {busy ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={styles.actionBtnText}>Submit for public gallery</Text>}
                    </Pressable>
                  )}

                  {item.visibility === 'public' && item.approvalStatus !== 'rejected' && (
                    <Pressable style={styles.actionBtnGhost} disabled={busy} onPress={() => makePrivate(item._id)}>
                      {busy ? <ActivityIndicator size="small" color={Colors.textMuted} /> : <Text style={styles.actionBtnGhostText}>Make private</Text>}
                    </Pressable>
                  )}

                  {item.approvalStatus === 'rejected' && (
                    <Pressable style={styles.actionBtn} disabled={busy} onPress={() => requestPublic(item._id)}>
                      {busy ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={styles.actionBtnText}>Resubmit for review</Text>}
                    </Pressable>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 50 },
  backBtnText: { color: Colors.accent, fontSize: 15, fontWeight: '700' },
  title: { color: Colors.text, fontSize: 17, fontWeight: '800' },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center' },
  listContent: { padding: Spacing.lg, gap: Spacing.md },
  card: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  thumb: {
    width: 72,
    height: 100,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface2,
  },
  cardInfo: { flex: 1, justifyContent: 'center', gap: 4 },
  cardTitle: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  cardStatus: { fontSize: 12, fontWeight: '600' },
  actionBtn: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  actionBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  actionBtnGhost: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  actionBtnGhostText: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' },
});
