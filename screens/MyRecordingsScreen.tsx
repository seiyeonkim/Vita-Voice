// src/screens/MyRecordingsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Recording } from '../type';
import DetailPlayer from '../components/DetailPlayer';
import {
  loadRecordings,
  deleteRecording,
  renameRecording,
} from '../src/services/recording';

export default function MyRecordingsScreen() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 화면 초기 로드: 저장된 녹음 목록 불러오기
  useEffect(() => {
    (async () => {
      const list = await loadRecordings();
      setRecordings(list);
    })();
  }, []);

  // 삭제 처리: 서비스 함수 호출 후 상태 업데이트
  const handleDelete = async (id: string) => {
    const updated = await deleteRecording(id);
    setRecordings(updated);
  };

  // 이름 변경: 서비스 함수 호출 후 상태 업데이트
  const handleRename = async (id: string, newTitle: string) => {
    const updated = await renameRecording(id, newTitle);
    setRecordings(updated);
  };

  // ISO 문자열을 'YYYY-MM-DD HH:mm'로 포맷
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  // 리스트 항목 렌더링
  const renderItem = ({ item }: { item: Recording }) => {
    const isExpanded = expandedId === item.id;
    const durationSec = Number(item.duration);

    return (
      <View style={styles.wrapper}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() =>
            setExpandedId(prev => (prev === item.id ? null : item.id))
          }
        >
          <Image
            source={require('../assets/images/mic.png')}
            style={styles.icon}
          />
          <View style={styles.info}>
            <Text numberOfLines={1} style={styles.title}>
              {item.title}
            </Text>
            <Text style={styles.meta}>
              {formatDate(item.createdAt)}
              {durationSec > 0 ? ` · ${durationSec}초` : ''}
            </Text>
          </View>
          <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.detail}>
            <DetailPlayer
              recording={item}
              onRename={newTitle => handleRename(item.id, newTitle)}
              onDelete={() =>
                Alert.alert(
                  '삭제 확인',
                  '정말 이 녹음을 삭제하시겠습니까?',
                  [
                    { text: '취소', style: 'cancel' },
                    {
                      text: '삭제',
                      style: 'destructive',
                      onPress: () => handleDelete(item.id),
                    },
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
      <Text style={styles.header}>내 음성 파일</Text>
      <FlatList
        data={recordings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  list: {
    paddingBottom: 30,
  },
  wrapper: {
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 12,
    resizeMode: 'contain',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  meta: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  chevron: {
    fontSize: 16,
    color: '#bbb',
    marginLeft: 8,
  },
  detail: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 1,
  },
});
