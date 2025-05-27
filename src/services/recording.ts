import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { Recording } from '../../type';


const STORAGE_KEY = '@recordings';

/**
 * Load all recordings from AsyncStorage
 */
export async function loadRecordings(): Promise<Recording[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? (JSON.parse(json) as Recording[]) : [];
  } catch (error) {
    console.error('loadRecordings error:', error);
    return [];
  }
}

/**
 * Persist recordings array to AsyncStorage
 */
async function saveRecordings(list: Recording[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('saveRecordings error:', error);
  }
}

/**
 * Add a new recording; throws if duplicate by path
 */
export async function addRecording(rec: Recording): Promise<Recording[]> {
  const list = await loadRecordings();
  if (list.some(r => r.path === rec.path)) {
    throw new Error('이미 추가된 파일입니다.');
  }
  const updated = [rec, ...list];
  await saveRecordings(updated);
  return updated;
}

/**
 * Delete a recording by id: remove file and metadata
 */
export async function deleteRecording(id: string): Promise<Recording[]> {
  const list = await loadRecordings();
  const target = list.find(r => r.id === id);
  if (target?.path) {
    try {
      const exists = await RNFS.exists(target.path);
      if (exists) {
        await RNFS.unlink(target.path);
      }
    } catch (error) {
      console.warn('파일 삭제 실패:', error);
    }
  }
  const updated = list.filter(r => r.id !== id);
  await saveRecordings(updated);
  return updated;
}

/**
 * Rename an existing recording's title
 */
export async function renameRecording(id: string, newTitle: string): Promise<Recording[]> {
  const list = await loadRecordings();
  const updated = list.map(r =>
    r.id === id ? { ...r, title: newTitle } : r
  );
  await saveRecordings(updated);
  return updated;
}
