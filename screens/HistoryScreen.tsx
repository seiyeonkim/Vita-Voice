import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/type';
import { useCallback } from 'react';

type HistoryRecord = {
  id: string;
  title: string;
  date: string;
  recordingName: string;
  diagnosisDate: string;
  prediction1: number;
  prediction2: number;
  diagnosis: ('parkinson' | 'language')[];
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'History'>;

export default function HistoryScreen() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const navigation = useNavigation<NavigationProp>();

  // ✅ 화면 진입 시 항상 최신 기록 불러오기
  useFocusEffect(
    useCallback(() => {
      const loadRecords = async () => {
        const json = await AsyncStorage.getItem('@history');
        const parsed = json ? JSON.parse(json) : [];
        setRecords(parsed);
      };
      loadRecords();
    }, [])
  );

  const deleteRecord = async (id: string) => {
    Alert.alert('삭제 확인', '이 기록을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const updated = records.filter((r) => r.id !== id);
            setRecords(updated);
            await AsyncStorage.setItem('@history', JSON.stringify(updated));
            console.log(`🗑 삭제 완료: ${id}`);
          } catch (error) {
            console.error('❌ 삭제 실패:', error);
          }
        },
      },
    ]);
  };

  const saveEditedTitle = async () => {
    const updated = records.map((r) =>
      r.id === editingId ? { ...r, title: editedTitle } : r
    );
    setRecords(updated);
    await AsyncStorage.setItem('@history', JSON.stringify(updated));
    setEditingId(null);
    setEditedTitle('');
  };

  const goToResult = (item: HistoryRecord) => {
    navigation.navigate('Result', {
      recordingName: item.recordingName,
      diagnosisDate: item.diagnosisDate,
      prediction1: item.prediction1,
      prediction2: item.prediction2,
      diagnosis: item.diagnosis,
    });
  };

  const renderItem = ({ item }: { item: HistoryRecord }) => (
    <View style={styles.card}>
      <Image
        source={require('../assets/images/diagnosis_record.png')}
        style={styles.icon}
      />

      <TouchableOpacity
        onPress={() => goToResult(item)}
        onLongPress={() => {
          setEditingId(item.id);
          setEditedTitle(item.title);
        }}
        style={styles.textBox}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => deleteRecord(item.id)}>
        <Image
          source={require('../assets/images/trash.png')}
          style={styles.trashIcon}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {records.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>진단기록이 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* 이름 변경 모달 */}
      <Modal visible={editingId !== null} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>이름 변경</Text>
            <TextInput
              value={editedTitle}
              onChangeText={setEditedTitle}
              style={styles.input}
              placeholder="새 이름을 입력하세요"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={saveEditedTitle} style={styles.btnSave}>
                <Text style={styles.btnText}>저장</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingId(null)} style={styles.btnCancel}>
                <Text style={styles.btnText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 16,
    resizeMode: 'contain',
  },
  textBox: { flex: 1 },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  date: { fontSize: 13, color: '#666' },
  trashIcon: {
    width: 15,
    height: 15,
    tintColor: '#FF5A5F',
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalBox: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  btnSave: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnCancel: {
    backgroundColor: '#aaa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
