// src/screens/HomeScreen.tsx
// 앱의 홈화면, 음성 녹음 / 파일 업로드 / 내 녹음 보기 세 가지 기능
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation/type';
import { openAudioPicker, copySafFileToInternal } from './src/native/audioPicker';
import { addRecording } from './src/services/recording';
import { Recording } from './type';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
const audioPlayer = new AudioRecorderPlayer();

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    const sdkVersion = parseInt(Platform.Version.toString(), 10);
    const perm =
      sdkVersion >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
    const res = await PermissionsAndroid.request(perm);
    if (res !== PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert('권한 거부됨', '오디오 파일 접근 권한이 필요합니다.');
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!(await requestPermission())) return;
    const file = await openAudioPicker();
    if (!file?.uri || !file?.name) return;

    try {
      const destPath = await copySafFileToInternal(file.uri);
      await audioPlayer.stopPlayer();
      audioPlayer.removePlayBackListener();
      let durationMs = 0;
      await new Promise<void>((resolve) => {
        audioPlayer.startPlayer(destPath).then(() => {
          audioPlayer.addPlayBackListener((e) => {
            durationMs = e.duration;
            audioPlayer.stopPlayer();
            audioPlayer.removePlayBackListener();
            resolve();
          });
        });
      });

      const newRec: Recording = {
        id: Date.now().toString(),
        title: file.name,
        path: destPath,
        uri: destPath,
        createdAt: new Date().toISOString(),
        duration: durationMs.toString(),
      };

      await addRecording(newRec);
      Alert.alert('성공', '파일이 추가되었습니다.');
      navigation.navigate('MyRecordings');
    } catch (err: any) {
      Alert.alert('오류', err.message || '파일 처리 중 문제가 발생했습니다.');
    }
  };

  const onPressRecord = () => {
    Alert.alert(
      '녹음 안내',
      "10초간 '아'를 연속으로 발음해주세요",
      [{ text: '확인', onPress: () => navigation.navigate('Record') }],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.topSection}>
          <Image
            source={require('./assets/images/doctor.png')}
            style={styles.character}
          />
          <Text style={styles.speech}>
            안녕하세요!
            {'\n'}VitaVoice와 함께 시작해볼까요?
          </Text>
        </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  character: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
  },
  speech: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
    lineHeight: 28,
    fontWeight: '500',
    marginTop: 16,
    paddingHorizontal: 12,
  },
  buttonGroup: {
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#9ACBD0',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
