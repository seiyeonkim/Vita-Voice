import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  PermissionsAndroid, Platform, Alert, Animated, Easing,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/type';
import { Recording } from '../type';

const audioRecorderPlayer = new AudioRecorderPlayer();

export default function RecordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Record'>>();

  const [isRecording, setIsRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    return () => {
      stopTimer();
      audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    } else {
      pulse.setValue(1);
    }
  }, [isRecording]);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: '마이크 권한 요청',
          message: '음성 녹음을 위해 마이크 접근 권한이 필요합니다.',
          buttonPositive: '허용',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const startTimer = () => {
    setRecordSecs(0);
    intervalRef.current = setInterval(() => {
      setRecordSecs(prev => prev + 1);
    }, 1000) as unknown as number;
  };

  const stopTimer = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const getInternalFilePath = () => {
    const filename = `voice_${Date.now()}.wav`;
    return `${RNFS.DocumentDirectoryPath}/${filename}`;
  };

  const startRecording = async () => {
    const ok = await requestPermission();
    if (!ok) {
      Alert.alert('권한 오류', '마이크 권한이 필요합니다.');
      return;
    }

    const path = getInternalFilePath();
    try {
      await audioRecorderPlayer.startRecorder(path);
      setStartTime(Date.now());
      setIsRecording(true);
      startTimer();
    } catch (e) {
      Alert.alert('녹음 실패', e instanceof Error ? e.message : '오류 발생');
    }
  };

  const stopRecording = async () => {
    try {
      const uri = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      stopTimer();
      setIsRecording(false);

      const end = Date.now();
      const start = startTime ?? end;
      const duration = end - start;

      const newRecording: Recording = {
        id: `${Date.now()}`,
        title: '음성 녹음',
        createdAt: new Date(start).toISOString(),
        duration: Math.floor(duration),
        uri,
        path: uri,
      };

      route.params?.onRecordComplete?.(newRecording);
      navigation.goBack();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartRequest = () => {
    Alert.alert(
      '안내',
      '10초간 "아"로 발음해주세요.',
      [
        {
          text: '확인',
          onPress: () => startRecording(),
        },
      ],
      { cancelable: false }
    );
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{formatTime(recordSecs)}</Text>
      <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulse }] }]}>
        <TouchableOpacity
          style={[styles.recordButton, isRecording ? styles.stop : styles.start]}
          onPress={isRecording ? stopRecording : handleStartRequest}
        >
          <Text style={styles.buttonText}>{isRecording ? '■' : '●'}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 20 },
  timer: { fontSize: 48, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  pulseCircle: {
    width: 120, height: 120, borderRadius: 60,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#f0f0f0', alignSelf: 'center',
  },
  recordButton: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
  },
  start: { backgroundColor: '#0a84ff' },
  stop: { backgroundColor: '#ff3b30' },
  buttonText: { fontSize: 30, color: '#fff' },
});
