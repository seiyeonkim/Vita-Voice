import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import DocumentPicker, { types } from 'react-native-document-picker';

export default function AudioPicker() {
  const pickAudio = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: types.audio,
        copyTo: 'cachesDirectory', // Android에서 접근 가능하게 복사
      });

      Alert.alert('파일 선택 완료', `파일 이름: ${res.name}`);
      console.log('선택된 파일:', res);

      // 여기서 파일 처리 가능 (예: 서버 업로드 등)
    } catch (err: unknown) {
      if (DocumentPicker.isCancel(err as Error)) {
        Alert.alert('취소됨', '파일 선택이 취소되었습니다.');
      } else {
        console.error(err);
        Alert.alert('에러', '파일을 선택하는 도중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={pickAudio}>
        <Text style={styles.buttonText}>오디오 파일 업로드</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  button: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
  },
  buttonText: { color: 'white', fontSize: 16 },
});
