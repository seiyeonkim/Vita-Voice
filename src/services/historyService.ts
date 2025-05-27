// src/services/historyService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@history';

/**
 * History 항목 타입
 */
export interface HistoryRecord {
  id: string;
  title: string;
  date: string;
  recordingName: string;
  diagnosisDate: string;
  prediction1: number;
  prediction2: number;
  diagnosis: ('parkinson' | 'language')[];
}

/**
 * 모든 기록을 로드합니다.
 */
export const loadHistory = async (): Promise<HistoryRecord[]> => {
  const json = await AsyncStorage.getItem(HISTORY_KEY);
  return json ? (JSON.parse(json) as HistoryRecord[]) : [];
};

/**
 * 기록 배열을 저장합니다.
 */
export const saveHistory = async (records: HistoryRecord[]): Promise<void> => {
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(records));
};

/**
 * 단일 기록을 추가하고, 전체 업데이트된 배열을 반환합니다.
 * - 중복 ID는 무시합니다.
 */
export const addHistoryRecord = async (
  record: HistoryRecord
): Promise<HistoryRecord[]> => {
  const list = await loadHistory();
  const exists = list.some(r => r.id === record.id);
  if (!exists) {
    const updated = [record, ...list];
    await saveHistory(updated);
    return updated;
  }
  return list;
};

/**
 * 특정 기록을 삭제하고, 전체 업데이트된 배열을 반환합니다.
 */
export const deleteHistoryRecord = async (
  id: string
): Promise<HistoryRecord[]> => {
  const list = await loadHistory();
  const updated = list.filter(r => r.id !== id);
  await saveHistory(updated);
  return updated;
};
