import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Image, Alert, Modal, ScrollView
} from 'react-native';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation/type';
import { Recording } from './type';
import DetailPlayer from './components/DetailPlayer';

const STORAGE_KEY = '@recordings';
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isFabOpen, setFabOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fileOptions, setFileOptions] = useState<string[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const data = JSON.parse(json).map((r: any) => ({
          ...r,
          duration: Number(r.duration) || 0,
        }));
        setRecordings(data);
      }
    };
    load();
  }, []);

  const save = async (data: Recording[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const handleRecordComplete = (newRecording: Recording) => {
    const updated = [newRecording, ...recordings];
    setRecordings(updated);
    save(updated);
  };

  const handleUpload = async () => {
    try {
      const files = await RNFS.readDir(RNFS.DownloadDirectoryPath);
      const audioFiles = files.filter(f =>
        /\.(wav|mp3|m4a)$/i.test(f.name)
      );

      if (audioFiles.length === 0) {
        Alert.alert('파일 없음', 'Download 폴더에 음성 파일이 없습니다.');
        return;
      }

      setFileOptions(audioFiles.map(f => f.path));
      setModalVisible(true);
    } catch (err) {
      Alert.alert('오류', '파일을 검색할 수 없습니다.');
      console.error(err);
    }
  };

  const handleFileSelect = (path: string) => {
    const fileName = path.split('/').pop() ?? '이름없음';
    if (recordings.some(r => r.path === path)) {
      Alert.alert('중복', '이미 추가된 파일입니다.');
      return;
    }

    const newRecording: Recording = {
      id: `${Date.now()}`,
      title: fileName.replace(/\.[^/.]+$/, ''),
      createdAt: new Date().toISOString(),
      duration: 0,
      path,
      uri: path,
    };

    const updated = [newRecording, ...recordings];
    setRecordings(updated);
    save(updated);
    setModalVisible(false);
    setFabOpen(false);
  };

  const handleDelete = (id: string) => {
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

  const renderItem = ({ item }: { item: Recording }) => {
    const durationSec = Math.floor(Number(item.duration) / 1000);
    return (
      <View>
        <TouchableOpacity
          style={styles.card}
          onPress={() => setExpandedId(prev => (prev === item.id ? null : item.id))}
        >
          <Image source={require('./assets/images/mic.png')} style={styles.icon} />
          <View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>
              {formatDate(item.createdAt)} {durationSec > 0 ? `· ${durationSec}초` : ''}
            </Text>
          </View>
        </TouchableOpacity>

        {expandedId === item.id && (
          <DetailPlayer
            recording={item}
            onRename={newTitle => handleRename(item.id, newTitle)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
      </View>
    );
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>음성 파일 녹음</Text>

      <FlatList
        data={recordings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      {/* 플로팅 + 버튼 */}
      <TouchableOpacity style={styles.fab} onPress={() => setFabOpen(!isFabOpen)}>
        <Text style={styles.fabPlus}>＋</Text>
      </TouchableOpacity>

      {/* 메뉴: 텍스트 왼쪽 + 원형 아이콘 오른쪽 */}
      {isFabOpen && (
        <View style={styles.fabMenu}>
          <View style={styles.fabMenuItem}>
            <Text style={styles.circleLabel}>녹음</Text>
            <TouchableOpacity style={styles.fabCircleButton} onPress={() => {
              setFabOpen(false);
              navigation.navigate('Record', { onRecordComplete: handleRecordComplete });
            }}>
              <Image source={require('./assets/images/mic.png')} style={styles.circleIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.fabMenuItem}>
            <Text style={styles.circleLabel}>파일 업로드</Text>
            <TouchableOpacity style={styles.fabCircleButton} onPress={handleUpload}>
              <Image source={require('./assets/images/upload.png')} style={styles.circleIcon} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 파일 선택 모달 */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>업로드할 파일 선택</Text>
            <ScrollView>
              {fileOptions.map((path) => {
                const name = path.split('/').pop();
                return (
                  <TouchableOpacity key={path} onPress={() => handleFileSelect(path)} style={styles.modalItem}>
                    <Text>{name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCancel}>
              <Text style={{ color: 'red' }}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 18, fontWeight: '600', margin: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 120 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  icon: { width: 32, height: 32, marginRight: 12, resizeMode: 'contain' },
  title: { fontSize: 16, fontWeight: '600' },
  date: { fontSize: 12, color: '#666', marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  fabPlus: {
    fontSize: 36,
    color: '#fff',
    lineHeight: 40,
  },
  fabMenu: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    gap: 16,
    zIndex: 19,
    alignItems: 'flex-end',
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fabCircleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  circleLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 12,
    padding: 16,
    maxHeight: '60%',
  },
  modalTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  modalItem: { paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
  modalCancel: { marginTop: 12, alignItems: 'center' },
});

export default HomeScreen;
