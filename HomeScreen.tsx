// HomeScreen.tsx (프로젝트 루트에 위치)
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation/type';
import { Recording } from './type';
import { openAudioPicker, copySafFileToInternal } from './src/native/audioPicker';
import {
  loadRecordings,
  addRecording,
  deleteRecording,
} from './src/services/recordingService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
const audioPlayer = new AudioRecorderPlayer();

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [recordings, setRecordings] = useState<Recording[]>([]);

  // 초기 로드
  useEffect(() => {
    (async () => {
      const list = await loadRecordings();
      setRecordings(list);
    })();
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    const sdkVersion = parseInt(Platform.Version.toString(), 10);
    let granted = false;
    if (sdkVersion >= 33) {
      granted = (await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
      )) === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      granted = (await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      )) === PermissionsAndroid.RESULTS.GRANTED;
    }
    if (!granted) Alert.alert('권한 거부됨', '오디오 파일 접근 권한이 필요합니다.');
    return granted;
  };

  const handleUpload = async () => {
    if (!(await requestPermission())) return;
    const file = await openAudioPicker();
    if (!file?.uri || !file?.name) return;

    try {
      // 파일 복사 및 duration 측정
      const destPath = await copySafFileToInternal(file.uri);
      await audioPlayer.stopPlayer();
      audioPlayer.removePlayBackListener();
      await audioPlayer.startPlayer(destPath);

      let duration = 0;
      await new Promise<void>((resolve) => {
        audioPlayer.addPlayBackListener((e) => {
          duration = e.duration;
          audioPlayer.stopPlayer();
          audioPlayer.removePlayBackListener();
          resolve();
        });
      });

      const originalName = decodeURIComponent(file.name).replace(/\.[^/.]+$/, '');
      const newRec: Recording = {
        id: Date.now().toString(),
        title: originalName,
        createdAt: new Date().toISOString(),
        duration: Math.round(duration / 1000),
        path: destPath,
        uri: destPath,
      };

      // 서비스 함수로 추가
      const updatedList = await addRecording(newRec);
      setRecordings(updatedList);

      Alert.alert('성공', '파일이 추가되었습니다.');
      navigation.getParent()?.navigate('MyRecordings');
    } catch (err: any) {
      if (err.message === '이미 추가된 파일입니다.') {
        Alert.alert('중복', err.message);
      } else {
        console.error(err);
        Alert.alert('오류', '파일 처리 중 문제가 발생했습니다.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    const updatedList = await deleteRecording(id);
    setRecordings(updatedList);
  };

  const onPressRecord = () => {
    Alert.alert(
      '녹음 안내',
      "10초간 '아'를 연속으로 발음해주세요",
      [{ text: '확인', onPress: () => navigation.navigate('RecordWave') }],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.header}>
            <Image source={require('./assets/images/doctor.png')} style={styles.character} />
            <Text style={styles.speech}>안녕하세요!{"\n"}VitaVoice와 함께 시작해볼까요?</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.actionButton} onPress={onPressRecord}>
                <Text style={styles.buttonText}>음성 녹음</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleUpload}>
                <Text style={styles.buttonText}>파일 업로드</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('MyRecordings')}
              >
                <Text style={styles.buttonText}>내 음성파일</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        data={recordings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.recordItem}>
            <Text>{item.title} ({item.duration}s)</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={{ color: 'red' }}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  listContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: { alignItems: 'center', width: '100%' },
  character: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginTop: 10,
    marginBottom: 20,
  },
  speech: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
    lineHeight: 28,
    fontWeight: '500',
    marginBottom: 40,
    paddingHorizontal: 12,
  },
  buttonGroup: {
    width: '100%',
    gap: 20,
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: '#9ACBD0',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
});
