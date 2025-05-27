import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/type';
import { SafeAreaView } from 'react-native-safe-area-context';

type Route = RouteProp<RootStackParamList, 'Result'>;

export default function ResultScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { recordingName, diagnosisDate, prediction1, prediction2 } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 닫기 버튼 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeText}>닫기</Text>
        </TouchableOpacity>
      </View>

      {/* 제목 */}
      <Text style={styles.title}>진단 결과</Text>

      {/* 결과 카드 */}
      <View style={styles.card}>
        <View style={styles.item}>
          <Text style={styles.label}>녹음 파일</Text>
          <Text style={styles.value}>{recordingName}</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>진단 일자</Text>
          <Text style={styles.value}>{diagnosisDate}</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>파킨슨병 예측</Text>
          <Text style={styles.highlight}>{prediction1}%</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>성대 질환 예측</Text>
          <Text style={styles.highlight}>{prediction2}%</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // 전체 배경 흰색
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF', // 배경도 흰색
    borderWidth: 1,
    borderColor: '#000',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF', 
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#000', 
  },
  item: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  highlight: {
    fontSize: 20,
    fontWeight: '700',
    color: '#9ACBD0',
  },
});
