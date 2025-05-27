import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image, SafeAreaView, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { Recording } from '../type';
import DetailPlayer from '../components/DetailPlayer';

const STORAGE_KEY = '@recordings';

export default function MyRecordingsScreen() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        setRecordings(JSON.parse(json));
      }
    };
    load();
  }, []);

  const save = async (data: Recording[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const handleDelete = async (id: string) => {
    const target = recordings.find(r => r.id === id);
    if (target?.path) {
      try {
        const exists = await RNFS.exists(target.path);
        if (exists) await RNFS.unlink(target.path);
      } catch (e) {
        console.warn('파일 삭제 실패:', e);
      }
    }
    const updated = recordings.filter(r => r.id !== id);
    setRecordings(updated);
    save(updated);
  };

  const handleRename = (id: string, newTitle: string) => {
    const updated = recordings.map(r =>
      r.id === id ? { ...r, title: newTitle } : r
    );
    setRecordings(updated);
    save(updated);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const renderItem = ({ item }: { item: Recording }) => {
    const isExpanded = expandedId === item.id;
    const durationSec = Number(item.duration);

    return (
      <View>
        <TouchableOpacity
          style={styles.card}
          onPress={() => setExpandedId(prev => (prev === item.id ? null : item.id))}
        >
          <Image source={require('../assets/images/mic.png')} style={styles.icon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>
              {formatDate(item.createdAt)} {durationSec > 0 ? `· ${durationSec}초` : ''}
            </Text>
          </View>
          <Text style={styles.arrowText}>{isExpanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.detail}>
            <DetailPlayer
              recording={item}
              onRename={newTitle => handleRename(item.id, newTitle)}
              onDelete={() =>
                Alert.alert(
                  '삭제 확인',
                  '이 녹음을 삭제하시겠습니까?',
                  [
                    { text: '취소', style: 'cancel' },
                    { text: '삭제', style: 'destructive', onPress: () => handleDelete(item.id) },
                  ]
                )
              }
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={recordings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fa', padding: 20 },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 14,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  meta: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  arrowText: {
    fontSize: 18,
    color: '#999',
    marginLeft: 8,
  },
  detail: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
});
