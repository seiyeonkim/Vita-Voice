import React, { useState, useLayoutEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Alert,
  Platform,
  PermissionsAndroid,
  TextInput,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { RootStackParamList } from '../navigation/type';
import { Recording } from '../type';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Record'>;
const recorder = new AudioRecorderPlayer();
const STORAGE_KEY = '@recordings';

export default function RecordScreen() {
  const navigation = useNavigation<NavProp>();
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [filePath, setFilePath] = useState('');
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [recordName, setRecordName] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const tabNav = navigation.getParent()?.getParent();
      tabNav?.setOptions({ tabBarStyle: { display: 'none' } });
      return () => tabNav?.setOptions({ tabBarStyle: undefined });
    }, [navigation])
  );

  const requestPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const res = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: '마이크 권한 요청',
        message: '녹음을 위해 마이크 권한이 필요합니다.',
        buttonPositive: '허용',
        buttonNegative: '거부',
      }
    );
    return res === PermissionsAndroid.RESULTS.GRANTED;
  };

  const onStart = async () => {
    if (!(await requestPermission())) {
      Alert.alert('권한 필요', '녹음 권한을 허용해주세요.');
      return;
    }
    setRecordSecs(0);
    const name = `recording_${Date.now()}`;
    const path = Platform.select({
      android: `${RNFS.ExternalDirectoryPath}/${name}.mp4`,
      ios: `${RNFS.DocumentDirectoryPath}/${name}.m4a`,
    })!;
    setFilePath(path);
    setIsRecording(true);
    await recorder.startRecorder(path);
    recorder.addRecordBackListener(e => {
      setRecordSecs(e.currentPosition);
      return;
    });
  };

  const onFinish = async () => {
    if (isRecording) {
      await recorder.stopRecorder();
      recorder.removeRecordBackListener();
      setIsRecording(false);
    }
    const d = new Date();
    const yyyy = d.getFullYear().toString();
    const MM = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    setRecordName(`${yyyy}${MM}${dd}_${hh}${mm}`);
    setSaveModalVisible(true);
  };

  const onCancel = () => setCancelModalVisible(true);
  const confirmCancel = async () => {
    if (isRecording) {
      await recorder.stopRecorder();
      recorder.removeRecordBackListener();
      setIsRecording(false);
    }
    setCancelModalVisible(false);
    navigation.goBack();
  };

  const confirmSave = async () => {
    if (!recordName.trim()) {
      Alert.alert('이름 필요', '녹음 제목을 입력해주세요.');
      return;
    }
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const list: Recording[] = json ? JSON.parse(json) : [];
      const newRec: Recording = {
        id: Date.now().toString(),
        title: recordName,
        path: filePath,
        uri: filePath,
        duration: recordSecs,
        createdAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([newRec, ...list]));
      setSaveModalVisible(false);
      navigation.goBack();
    } catch {
      Alert.alert('저장 실패', '녹음을 저장하지 못했습니다.');
    }
  };

  const formatTime = () => {
    const sec = Math.floor(recordSecs / 1000);
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.headerText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onFinish}>
          <Text style={styles.headerText}>저장</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Image
          source={require('../assets/images/Recording.gif')}
          style={styles.micGif}
          resizeMode="contain"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.timer}>{formatTime()}</Text>
        <TouchableOpacity
          onPress={isRecording ? onFinish : onStart}
          style={styles.playPause}
        >
          <Image
            source={
              isRecording
                ? require('../assets/images/pause.png')
                : require('../assets/images/play.png')
            }
            style={styles.playPauseIcon}
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>녹음을 취소하시겠습니까?</Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setCancelModalVisible(false)}
                style={styles.modalBtn}
              >
                <Text style={styles.modalBtnText}>아니요</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmCancel} style={styles.modalBtn}>
                <Text style={styles.modalBtnText}>예</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={saveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSaveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>음성녹음</Text>
            <TextInput
              style={styles.textInput}
              value={recordName}
              onChangeText={setRecordName}
              placeholder="제목을 입력하세요"
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setSaveModalVisible(false)}
                style={styles.modalBtn}
              >
                <Text style={styles.modalBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmSave} style={styles.modalBtn}>
                <Text style={styles.modalBtnText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  headerText: { fontSize: 18, fontWeight: '600', color: '#333' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micGif: { width: 150, height: 150 },
  footer: {
    alignItems: 'center',
    marginBottom: 30, // 👈 아래로부터 간격 확보
  },
  timer: { fontSize: 24, marginBottom: 16, color: '#333' },
  playPause: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#9ACBD0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIcon: { width: 32, height: 32 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, marginBottom: 12, color: '#333' },
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  modalBtnText: { fontSize: 16, color: '#333' },
});
