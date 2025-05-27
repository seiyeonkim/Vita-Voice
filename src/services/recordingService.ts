// src/services/recordingService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recording } from '../../type';

const STORAGE_KEY = '@recordings';

/**
 * 저장된 모든 녹음·파일 목록을 불러옵니다.
 */
export const loadRecordings = async (): Promise<Recording[]> => {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? (JSON.parse(json) as Recording[]) : [];
};

/**
 * 주어진 목록을 AsyncStorage에 덮어씁니다.
 */
export const saveRecordings = async (recordings: Recording[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recordings));
};

/**
 * 새 녹음(또는 파일)을 목록에 추가하고 저장한 뒤, 업데이트된 목록을 리턴합니다.
 * 중복 uri가 있으면 에러를 던집니다.
 */
export const addRecording = async (newRec: Recording): Promise<Recording[]> => {
  const list = await loadRecordings();
  if (list.some(r => r.uri === newRec.uri)) {
    throw new Error('이미 추가된 파일입니다.');
  }
  const updated = [newRec, ...list];
  await saveRecordings(updated);
  return updated;
};

/**
 * id를 기준으로 특정 녹음(또는 파일)을 삭제하고, 업데이트된 목록을 리턴합니다.
 */
export const deleteRecording = async (id: string): Promise<Recording[]> => {
  const list = await loadRecordings();
  const updated = list.filter(r => r.id !== id);
  await saveRecordings(updated);
  return updated;
};
