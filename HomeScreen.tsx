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
import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation/type';
import { Recording } from './type';
import { openAudioPicker, copySafFileToInternal } from './src/native/audioPicker';

const STORAGE_KEY = '@recordings';
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const audioPlayer = new AudioRecorderPlayer();

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [recordings, setRecordings] = useState<Recording[]>([]);

  useEffect(() => {
    const load = async () => {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) setRecordings(JSON.parse(json));
    };
    load();
  }, []);

  const save = async (data: Recording[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    const sdkVersion = parseInt(Platform.Version.toString(), 10);
    let granted = false;
    if (sdkVersion >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
      );
      granted = result === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      granted = result === PermissionsAndroid.RESULTS.GRANTED;
    }
    if (!granted) Alert.alert('권한 거부됨', '오디오 파일 접근 권한이 필요합니다.');
    return granted;
  };

  const handleUpload = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;
    const file = await openAudioPicker();
    if (!file || !file.uri || !file.name) return;
    try {
      await handleSelectFile({ uri: file.uri, name: file.name });
    } catch (err) {
      Alert.alert('오류', '파일 복사 또는 재생 중 문제가 발생했습니다.');
      console.error(err);
    }
  };

  const handleSelectFile = async (file: { name: string; uri: string }) => {
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
    const newRecording: Recording = {
      id: Date.now().toString(),
      title: originalName,
      createdAt: new Date().toISOString(),
      duration: Math.round(duration / 1000),
      path: destPath,
      uri: destPath,
    };

    if (recordings.some((r) => r.uri === newRecording.uri)) {
      Alert.alert('중복', '이미 추가된 파일입니다.');
      return;
    }
    const updated = [newRecording, ...recordings];
    setRecordings(updated);
    save(updated);
    Alert.alert('성공', '파일이 추가되었습니다.');
    navigation.getParent()?.navigate('MyRecordings');
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
        renderItem={() => null}
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
}); 