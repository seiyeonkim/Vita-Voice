// src/screens/LoadingScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator
} from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp         
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/type';
import { wait } from '../src/services/timerService';  // ← 경로 수정

import { analyzeDiagnosis } from '../src/services/analyze';
import { Alert } from 'react-native';

type LoadingRouteProp = RouteProp<RootStackParamList, 'Loading'>;
type LoadingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Loading'>;

export default function LoadingScreen() {
  const navigation = useNavigation<LoadingNavigationProp>();
  const route = useRoute<LoadingRouteProp>();
  const { recording, diagnosis, diagnosisDate } = route.params;
  const { gender, fileId } = route.params;
  const mode = diagnosis[0]

  useEffect(() => {
    (async () => {
      try {
        // 진단 요청
        const response = await analyzeDiagnosis({
          fileId: fileId,
          gender: gender,
          mode: mode,
        });

        await wait(1000); // UX용 잠깐 대기

        const { prediction, probabilities } = response.data;
        // ✅ 결과값을 받아 Result 화면으로 이동
        navigation.navigate('Result', {
          recordingName: recording.title,
          diagnosisDate,
          prediction1: probabilities[0], // ← 아래에서 진짜 prediction 값으로 대체
          prediction2: 0,
          diagnosis,
          duration : 10.0,
        });
      } catch (error) {
        console.error('진단 요청 실패:', error);
        Alert.alert('오류', '진단 요청에 실패했습니다. 인터넷 연결을 확인해주세요.');
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>진단 중입니다...</Text>
      <Image
        source={require('../assets/images/doctor.png')}
        style={styles.image}
      />
      <ActivityIndicator size="large" color="#4CAF50" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
  },
  image: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    marginBottom: 32,
  },
  spinner: { marginTop: 10 },
});
