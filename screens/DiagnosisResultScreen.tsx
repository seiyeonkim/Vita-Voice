import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/type';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Route = RouteProp<RootStackParamList, 'Result'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DiagnosisResultScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<NavigationProp>();

  const {
    recordingName,
    prediction1,
    prediction2,
    diagnosis = [],
  } = route.params;

  const now = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  useEffect(() => {
    const saveHistory = async () => {
      const newRecord = {
        id: `${Date.now()}`,
        title: diagnosis
          .map((d) => (d === 'parkinson' ? '파킨슨병' : '성대 질환'))
          .join(', '),
        date: now,
        recordingName,
        diagnosisDate: now,
        prediction1,
        prediction2,
        diagnosis,
      };

      const json = await AsyncStorage.getItem('@history');
      const existing = json ? JSON.parse(json) : [];
      const updated = [newRecord, ...existing];
      await AsyncStorage.setItem('@history', JSON.stringify(updated));
    };

    saveHistory();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <View style={{ width: 60 }} />
        <Text style={styles.headerTitle}>진단 결과</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Tabs')} style={{ width: 60, alignItems: 'flex-end' }}>
          <Text style={styles.headerExit}>종료</Text>
        </TouchableOpacity>
      </View>

      {/* 콘텐츠 */}
      <View style={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>녹음 파일명</Text>
          <Text style={styles.infoValue}>{recordingName}</Text>
          <Text style={styles.infoLabel}>진단 일자</Text>
          <Text style={styles.infoValue}>{now}</Text>
        </View>

        {diagnosis.includes('parkinson') && (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Image source={require('../assets/images/brain.png')} style={styles.icon} />
              <Text style={styles.cardTitle}>파킨슨병</Text>
            </View>
            <Text style={styles.resultText}>정상</Text>
            <Text style={styles.probability}>예측 확률: {prediction1}%</Text>
            <Text style={styles.cardDescription}>
              파킨슨병은 정상 범위로 분석되었습니다. 현재로서는 특별한 이상 징후가 나타나지 않습니다.
            </Text>
          </View>
        )}

        {diagnosis.includes('language') && (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Image source={require('../assets/images/language.png')} style={styles.icon} />
              <Text style={styles.cardTitle}>성대 질환</Text>
            </View>
            <Text style={styles.resultText}>정상</Text>
            <Text style={styles.probability}>예측 확률: {prediction2}%</Text>
            <Text style={styles.cardDescription}>
              성대 질환은 정상 범위로 분석되었습니다. 현재로서는 특별한 이상 징후가 나타나지 않습니다.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    flex: 1,
  },
  headerExit: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  content: {
    flexGrow: 1,
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 10,
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 14,
    color: '#777',
    marginTop: 10,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resultText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 6,
  },
  probability: {
    textAlign: 'center',
    fontSize: 14,
    color: '#2e7d32',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
  },
});
