import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api'; // 서버 API 요청을 위해 필요!

const HISTORY_KEY = '@history';

/**
 * 로컬 저장소에 쓰이는 History 항목 타입
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
 * 서버 응답 raw 타입 (snake_case)
 */
interface RawServerHistoryRecord {
  diagnosis_id: number;
  file_id: string;
  file_name: string;
  upload_time: string;
}

/**
 * 변환된 서버 기록 타입 (camelCase)
 */
export interface ServerHistoryRecord {
  diagnosisId: number;
  fileId: string;
  fileName: string;
  uploadTime: string;
}

/**
 * 서버에서 진단 기록 리스트 가져오기 (GET /history/list)
 */
export const getServerHistoryList = async (): Promise<ServerHistoryRecord[]> => {
  const response = await API.get<RawServerHistoryRecord[]>('/history/list');
  console.log('서버 응답:', response.data);
  const data = response.data;
  
  return data;
};

/**
 * 모든 로컬 기록을 로드합니다.
 */
export const loadHistory = async (): Promise<HistoryRecord[]> => {
  try {
    const json = await AsyncStorage.getItem(HISTORY_KEY);
    return json ? (JSON.parse(json) as HistoryRecord[]) : [];
  } catch (e) {
    console.warn('로컬 기록 불러오기 실패 (JSON 파싱 오류):', e);
    await AsyncStorage.removeItem(HISTORY_KEY);
    return [];
  }
};

/**
 * 로컬 기록 배열을 저장합니다.
 */
export const saveHistory = async (records: HistoryRecord[]): Promise<void> => {
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(records));
};

/**
 * 단일 로컬 기록을 추가하고, 전체 업데이트된 배열을 반환합니다.
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
 * 특정 로컬 기록을 삭제하고, 전체 업데이트된 배열을 반환합니다.
 */
export const deleteHistoryRecord = async (
  id: string
): Promise<HistoryRecord[]> => {
  const list = await loadHistory();
  const updated = list.filter(r => r.id !== id);
  await saveHistory(updated);
  return updated;
};
