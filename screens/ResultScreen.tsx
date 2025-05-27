// src/screens/ResultScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/type';

// Route 및 Navigation 타입 선언
type ResultRouteProp = RouteProp<RootStackParamList, 'Result'>;
type ResultNavProp = NativeStackNavigationProp<RootStackParamList, 'Result'>;

export default function ResultScreen() {
  const navigation = useNavigation<ResultNavProp>();
  const route = useRoute<ResultRouteProp>();

  // 네비게이션 파라미터로 넘어온 값들
  const {
    recordingName,
    diagnosisDate,
    prediction1,
    prediction2,
    // skipSave, diagnosis 등 추가적으로 필요하다면 여기에 선언
  } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      {/* 닫기 버튼 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeText}>닫기</Text>
        </TouchableOpacity>
      </View>

      {/* 제목 */}
      <Text style={styles.title}>진단 결과</Text>

      {/* 결과 카드 */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>녹음 파일</Text>
          <Text style={styles.value}>{recordingName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>진단 일자</Text>
          <Text style={styles.value}>{diagnosisDate}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>파킨슨병 예측</Text>
          <Text style={styles.highlight}>{prediction1}%</Text>
        </View>
        <View style={styles.row}>
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
  row: {
    flexDirection: 'row',
    marginBottom: 18,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
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
