// src/screens/HistoryScreen.tsx
import React, { useState, useCallback } from 'react';
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
import { getServerHistoryList } from '../src/services/historyService';
import {
  getDiagnosisResult,
  deleteDiagnosisResult,
} from '../src/services/diagnosisHistoryService';

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

type ServerHistoryRecord = {
  diagnosisId: number;
  fileId: string;
  fileName: string;
  uploadTime: string;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'History'>;

export default function HistoryScreen() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const navigation = useNavigation<NavigationProp>();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const json = await AsyncStorage.getItem('@history');
        const localRecords: HistoryRecord[] = json ? JSON.parse(json) : [];

        let serverRecords: ServerHistoryRecord[] = [];
        try {
          serverRecords = await getServerHistoryList();
          console.log("서버 기록 수:", serverRecords.length);
          console.log("서버 기록 예시:", serverRecords[0]);
        } catch (e) {
          console.warn('서버 기록 불러오기 실패:', e);
        }

        const converted = serverRecords.map(
          (r): HistoryRecord => ({
            id: r.diagnosisId.toString(),
            title: r.fileName,
            date: r.uploadTime,
            recordingName: r.fileName,
            diagnosisDate: r.uploadTime,
            prediction1: 0,
            prediction2: 0,
            diagnosis: [],
          })
        );

        converted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setRecords(converted);

      })();
    }, [])
  );

  const deleteRecord = (id: string) => {
    Alert.alert('삭제 확인', '이 기록을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const success = await deleteDiagnosisResult(Number(id));
            if (!success) {
              Alert.alert('오류', '서버 삭제 실패');
              return;
            }
          } catch (err) {
            Alert.alert('오류', '서버 요청 실패');
            console.warn(err);
          }

          const updated = records.filter(r => r.id !== id);
          setRecords(updated);
          await AsyncStorage.setItem('@history', JSON.stringify(updated));
        },
      },
    ]);
  };

  const saveEditedTitle = async () => {
    const updated = records.map(r =>
      r.id === editingId ? { ...r, title: editedTitle } : r
    );
    setRecords(updated);
    await AsyncStorage.setItem('@history', JSON.stringify(updated));
    setEditingId(null);
    setEditedTitle('');
  };

  const goToResult = async (item: HistoryRecord) => {
    try {
      const result = await getDiagnosisResult(Number(item.id));

      const prediction1 = result.probabilities?.[0] ?? 0;
      const prediction2 = result.probabilities?.[1] ?? 0;

      const diagnosis: ('parkinson' | 'language')[] = [];
      if (prediction1 >= 50) diagnosis.push('parkinson');
      if (prediction2 >= 50) diagnosis.push('language');

      navigation.navigate('Result', {
        recordingName: item.recordingName,
        diagnosisDate: result.analyzedAt,
        prediction1,
        prediction2,
        diagnosis,
        skipSave: true,
      });
    } catch (err) {
      Alert.alert('에러', '결과를 불러오는 데 실패했습니다.');
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyBox}>
      <Text style={styles.emptyText}>진단 기록이 없습니다.</Text>
    </View>
  );

  const renderItem = ({ item }: { item: HistoryRecord }) => (
    <View style={styles.card}>
      <View style={styles.iconWrapper}>
        <Image
          source={require('../assets/images/diagnosis_record.png')}
          style={styles.icon}
        />
      </View>
      <TouchableOpacity
        style={styles.textBox}
        onPress={() => goToResult(item)}
        onLongPress={() => {
          setEditingId(item.id);
          setEditedTitle(item.title);
        }}
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
      <View style={styles.headerBox}>
        <Text style={styles.headerText}>진단 기록</Text>
      </View>

      <FlatList
        data={records}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          records.length === 0 ? { flex: 1 } : { paddingBottom: 20 }
        }
      />

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
  container: { flex: 1, backgroundColor: '#FAFAFA', paddingHorizontal: 16 },
  headerBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginVertical: 12,
  },
  headerText: { fontSize: 20, fontWeight: '600', color: '#444' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  iconWrapper: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#E6F2F3', justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  icon: { width: 30, height: 30, resizeMode: 'contain' },
  textBox: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  date: { fontSize: 13, color: '#777' },
  trashIcon: { width: 18, height: 18, tintColor: '#E57373' },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' },
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalBox: { width: 300, backgroundColor: '#fff', borderRadius: 14, padding: 24, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14, color: '#333' },
  input: {
    width: '100%', borderWidth: 1, borderColor: '#ccc',
    borderRadius: 8, padding: 10, marginBottom: 20, backgroundColor: '#F9F9F9',
  },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  btnSave: { flex: 1, backgroundColor: '#9ACBD0', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginRight: 8 },
  btnCancel: { flex: 1, backgroundColor: '#BDBDBD', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
