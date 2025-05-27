// src/screens/DiagnosisResultScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  RouteProp,
  useRoute,
  useNavigation,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/type';
import {
  addHistoryRecord,
  HistoryRecord,
} from '../src/services/historyService';

type Route = RouteProp<RootStackParamList, 'Result'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Result'>;

export default function DiagnosisResultScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<NavigationProp>();
  const {
    recordingName,
    prediction1,
    prediction2,
    diagnosis = [],
    skipSave = false,
  } = route.params;

  // 결과 화면에 표시할 “지금” 시각
  const now = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  useEffect(() => {
    if (skipSave) return; // 이미 저장된 기록을 보러 온 경우 저장 로직 건너뜀

    const record: HistoryRecord = {
      id: `${recordingName}|${now}`,
      title: diagnosis
        .map(d => (d === 'parkinson' ? '파킨슨병' : '성대 질환'))
        .join(', '),
      date: now,
      recordingName,
      diagnosisDate: now,
      prediction1,
      prediction2,
      diagnosis,
    };

    addHistoryRecord(record);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>진단 결과</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Tabs')}>
          <Text style={styles.exitText}>종료</Text>
        </TouchableOpacity>
      </View>

      {/* 파일명 · 진단 일시 */}
      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>파일명</Text>
        <Text style={styles.infoValue}>{recordingName}</Text>
        <Text style={[styles.infoLabel, { marginTop: 12 }]}>진단 일시</Text>
        <Text style={styles.infoValue}>{now}</Text>
      </View>

      {/* 파킨슨병 결과 */}
      {diagnosis.includes('parkinson') && (
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Image
              source={require('../assets/images/brain.png')}
              style={styles.icon}
            />
            <Text style={styles.cardTitle}>파킨슨병</Text>
          </View>
          <Text style={styles.resultText}>정상</Text>
          <Text style={styles.probability}>예측 확률: {prediction1}%</Text>
          <Text style={styles.cardDescription}>
            파킨슨병은 정상 범위로 분석되었습니다. 현재로서는 특별한 이상 징후가
            나타나지 않습니다.
          </Text>
        </View>
      )}

      {/* 성대 질환 결과 */}
      {diagnosis.includes('language') && (
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Image
              source={require('../assets/images/language.png')}
              style={styles.icon}
            />
            <Text style={styles.cardTitle}>성대 질환</Text>
          </View>
          <Text style={styles.resultText}>정상</Text>
          <Text style={styles.probability}>예측 확률: {prediction2}%</Text>
          <Text style={styles.cardDescription}>
            성대 질환은 정상 범위로 분석되었습니다. 현재로서는 특별한 이상 징후가
            나타나지 않습니다.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
  },
  exitText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#F4F6F8',
    borderRadius: 12,
    padding: 18,
    marginBottom: 28,
  },
  infoLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  card: {
    backgroundColor: '#F9FCFF',
    borderRadius: 14,
    padding: 22,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 6,
  },
  probability: {
    fontSize: 14,
    color: '#388E3C',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
  },
});
