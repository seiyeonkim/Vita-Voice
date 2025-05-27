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

type LoadingRouteProp = RouteProp<RootStackParamList, 'Loading'>;
type LoadingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Loading'>;

export default function LoadingScreen() {
  const navigation = useNavigation<LoadingNavigationProp>();
  const route = useRoute<LoadingRouteProp>();
  const { recording, diagnosis, diagnosisDate } = route.params;

  useEffect(() => {
    (async () => {
      await wait(2000);  // 2초 대기
      navigation.navigate('Result', {
        recordingName: recording.title,
        diagnosisDate,
        prediction1: 87,
        prediction2: 85,
        diagnosis,
      });
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
