// src/services/diagnosisSelectionService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const DIAGNOSIS_SELECTION_KEY = '@diagnosis_selection';

export type DiagnosisType = 'parkinson' | 'language';

/**
 * 저장된 진단 항목 배열을 불러옵니다.
 */
export const loadDiagnosisSelection = async (): Promise<DiagnosisType[]> => {
  const json = await AsyncStorage.getItem(DIAGNOSIS_SELECTION_KEY);
  return json ? (JSON.parse(json) as DiagnosisType[]) : [];
};

/**
 * 선택된 진단 항목 배열을 저장합니다.
 */
export const saveDiagnosisSelection = async (
  selection: DiagnosisType[]
): Promise<void> => {
  await AsyncStorage.setItem(
    DIAGNOSIS_SELECTION_KEY,
    JSON.stringify(selection)
  );
};

/**
 * 저장된 진단 항목을 삭제(초기화)합니다.
 */
export const clearDiagnosisSelection = async (): Promise<void> => {
  await AsyncStorage.removeItem(DIAGNOSIS_SELECTION_KEY);
};