//React Native 앱에서 진단에 사용할 녹음 파일을 선택하는 화면
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/type';
import { RouteProp } from '@react-navigation/native';
import { Recording } from '../type';

import { uploadDiagnosis } from '../src/services/upload'

const STORAGE_KEY = '@recordings';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'SelectRecording'>;
type Route = RouteProp<RootStackParamList, 'SelectRecording'>;

export default function SelectRecordingScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<Route>();
  const { gender, diagnosis, diagnosisDate } = route.params;

  const [recordings, setRecordings] = useState<Recording[]>([]);

  useEffect(() => {
    const load = async () => {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const data: Recording[] = JSON.parse(json);
        setRecordings(data);
      }
    };
    load();
  }, []);

const handleSelect = async (recording: Recording) => {
  console.log('handleSelect 실행, 파일 URI:', recording.uri);
  try {
    const metadata = {
      fileName: recording.title,
      gender: gender,
      duration: 7.2,
    };

    const result = await uploadDiagnosis(recording.uri, metadata);
    console.log('업로드 성공:', result);

    navigation.navigate('Loading', {
      gender,
      diagnosis,
      recording,
      diagnosisDate,
    });
  } catch (error) {
    console.error('업로드 실패:', error);
  }
};


  const renderItem = ({ item }: { item: Recording }) => {
    const durationSec = Math.floor(Number(item.duration) / 1000);
    return (
      <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)}>
        <Image source={require('../assets/images/mic.png')} style={styles.icon} />
        <View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>{item.createdAt} {durationSec > 0 ? `· ${durationSec}초` : ''}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>진단할 음성파일을 선택해주세요.</Text>
      <FlatList
        data={recordings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  header: { fontSize: 16, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f9f9f9', padding: 16,
    borderRadius: 12, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 4, elevation: 2,
  },
  icon: { width: 28, height: 28, marginRight: 12, resizeMode: 'contain' },
  title: { fontSize: 16, fontWeight: '600' },
  date: { fontSize: 12, color: '#666', marginTop: 4 },
});