import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  Modal,
  TextInput,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import AudioRecorderPlayer, { RecordBackType } from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recording } from '../type';

// 아이콘 경로
const ICON_RECORD = require('../assets/images/record-inactive.png');
const ICON_STOP = require('../assets/images/pause.png');

const { width: screenWidth } = Dimensions.get('window');
const canvasWidth = screenWidth - 40;
const canvasHeight = 120;
const MAX_SAMPLES = 60;
const SILENCE_THRESHOLD = 2;
const audioRecorderPlayer = new AudioRecorderPlayer();

export default function RecordScreen() {
  const navigation = useNavigation();
  const [samples, setSamples] = useState<number[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [fileName, setFileName] = useState('');
  const [tempPath, setTempPath] = useState('');
  const defaultNameRef = useRef('');
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    stopTimer();
    audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
  }, []);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const ok = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      return ok === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const startTimer = () => {
    setRecordSecs(0);
    timerRef.current = setInterval(() => setRecordSecs((s) => s + 1), 1000) as unknown as number;
  };
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    if (!(await requestPermission())) return Alert.alert('권한 오류', '마이크 권한을 허용해주세요.');

    audioRecorderPlayer.setSubscriptionDuration(0.05);
    const path = `${RNFS.DocumentDirectoryPath}/temp_${Date.now()}.wav`;
    await audioRecorderPlayer.startRecorder(path);
    audioRecorderPlayer.addRecordBackListener((e: RecordBackType) => {
      const db = Math.max(Math.min(e.currentMetering ?? 0, 0), -160);
      const ratio = 1 - Math.abs(db) / 160;
      const height = Math.round(ratio * canvasHeight);
      setSamples((prev) => {
        const next = [...prev, height > SILENCE_THRESHOLD ? height : 0];
        return next.length > MAX_SAMPLES ? next.slice(-MAX_SAMPLES) : next;
      });
    });

    setTempPath(path);
    setIsRecording(true);
    setSamples([]);
    startTimer();
  };

  const stopRecording = async () => {
    await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    stopTimer();
    setIsRecording(false);
    const now = new Date();
    const pad2 = (n: number) => n.toString().padStart(2, '0');
    defaultNameRef.current = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}_${pad2(now.getHours())}${pad2(now.getMinutes())}`;
    setFileName(defaultNameRef.current);
    setModalVisible(true);
  };

  const saveRecording = async () => {
    const title = fileName.trim() || defaultNameRef.current;
    const newPath = `${RNFS.DocumentDirectoryPath}/${title}.wav`;
    await RNFS.moveFile(tempPath, newPath);
    const newRec: Recording = { id: Date.now().toString(), title, createdAt: new Date().toISOString(), duration: recordSecs, uri: newPath, path: newPath };
    const stored = await AsyncStorage.getItem('@recordings');
    const list: Recording[] = stored ? JSON.parse(stored) : [];
    list.unshift(newRec);
    await AsyncStorage.setItem('@recordings', JSON.stringify(list));
    setModalVisible(false);
    setFileName('');
    navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: 'Tabs', params: { screen: '홈' } }, { name: 'Tabs', params: { screen: 'MyRecordings' } }] }));
  };

  // 말을 할 때만 bar 그리기 (height > threshold)
  const drawBars = (data: number[]) => {
    const path = Skia.Path.Make();
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const barW = canvasWidth / MAX_SAMPLES;
    data.forEach((h, i) => {
      if (h > 0) {
        const x = cx - i * barW;
        path.moveTo(x, cy);
        path.lineTo(x, cy - h);
      }
    });
    return path;
  };

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.container}>
      {!isRecording && <Text style={styles.guide}>10초간 '아' 발음해주세요</Text>}
      <Text style={styles.timer}>{fmt(recordSecs)}</Text>

      <View style={styles.waveContainer}>
        <Canvas style={styles.canvas}>
          <Path path={drawBars(samples)} style="stroke" strokeWidth={2} color="#888" />
        </Canvas>
        <View style={styles.centerLine} />
      </View>

      <TouchableOpacity style={styles.button} onPress={isRecording ? stopRecording : startRecording}>
        <Image source={isRecording ? ICON_STOP : ICON_RECORD} style={styles.buttonIcon} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>파일 이름</Text>
            <TextInput style={styles.input} value={fileName} onChangeText={setFileName} />
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Text>취소</Text></TouchableOpacity>
              <TouchableOpacity onPress={saveRecording}><Text style={{ color: '#4CAF50' }}>저장</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 20, alignItems: 'center' },
  guide: { fontSize: 16, color: '#666', marginVertical: 10 },
  timer: { fontSize: 32, color: '#333' },
  waveContainer: { width: canvasWidth, height: canvasHeight, backgroundColor: '#F7F6F5', borderRadius: 8, overflow: 'hidden', marginVertical: 20 },
  canvas: { width: canvasWidth, height: canvasHeight },
  centerLine: { position: 'absolute', left: canvasWidth / 2 - 1, width: 2, height: canvasHeight, backgroundColor: '#E5534B' },
  button: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', elevation: 3 },
  buttonIcon: { width: 40, height: 40, resizeMode: 'contain' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '80%', backgroundColor: '#FFF', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 8, marginBottom: 12 },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
});