import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/type';

type Route = RouteProp<RootStackParamList, 'Result'>;

export default function ResultScreen() {
  const route = useRoute<Route>();
  const { recordingName, diagnosisDate, prediction1, prediction2 } = route.params;

  useEffect(() => {
    const saveRecord = async () => {
      const newRecord = {
        id: `${Date.now()}`,
        title: `진단 결과`,
        date: diagnosisDate,
        recordingName,
        prediction1,
        prediction2,
      };

      const json = await AsyncStorage.getItem('@history');
      const existing = json ? JSON.parse(json) : [];
      const updated = [newRecord, ...existing];

      await AsyncStorage.setItem('@history', JSON.stringify(updated));
    };

    saveRecord();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>진단 결과</Text>
      <Text style={styles.info}>녹음 파일: {recordingName}</Text>
      <Text style={styles.info}>진단 일자: {diagnosisDate}</Text>
      <Text style={styles.info}>파킨슨병 예측: {prediction1}%</Text>
      <Text style={styles.info}>성대 질환 예측: {prediction2}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
  info: { fontSize: 16, marginBottom: 12 },
});
