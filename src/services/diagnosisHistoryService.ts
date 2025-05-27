// src/services/diagnosisHistoryService.ts
import API from '../api';

export interface DiagnosisHistoryDetailDto {
  fileId: string;
  prediction: number;
  probabilities: number[];
  analyzedAt: string;
}

/**
 * 단일 진단 기록(결과) 조회
 * @param diagnosisId 백엔드에서 발급한 진단 ID
 */
export const getDiagnosisResult = async (
  diagnosisId: number
): Promise<DiagnosisHistoryDetailDto> => {
  const { data } = await API.get<DiagnosisHistoryDetailDto>(
    `/history/result/${diagnosisId}`
  );
  return data;
};

/**
 * 단일 진단 기록(결과) 삭제
 * @param diagnosisId 백엔드에서 발급한 진단 ID
 */
export const deleteDiagnosisResult = async (
  diagnosisId: number
): Promise<void> => {
  await API.delete(`/history/result/${diagnosisId}`);
};
