// src/services/diagnosisHistoryService.ts
import API from '../api';

/**
 * 서버에서 받아오는 진단 결과 상세 타입
 */
export interface DiagnosisHistoryDetailDto {
  fileId: string;
  prediction: number;
  probabilities: number[]; // 예: [85.5, 14.5]
  analyzedAt: string;
}

/**
 * 단일 진단 기록(결과) 조회
 * @param diagnosisId 백엔드에서 발급한 진단 ID (path param)
 */
export const getDiagnosisResult = async (
  diagnosisId: number
): Promise<DiagnosisHistoryDetailDto> => {
  try {
    const { data } = await API.get<DiagnosisHistoryDetailDto>(
      `/history/result/${diagnosisId}`
    );
    return data;
  } catch (error) {
    console.error('진단 결과 불러오기 실패:', error);
    throw new Error('서버에서 진단 결과를 불러오지 못했습니다.');
  }
};

/**
 * 단일 진단 기록(결과) 삭제
 * @param diagnosisId 백엔드에서 발급한 진단 ID (path param)
 */
export const deleteDiagnosisResult = async (
  diagnosisId: number
): Promise<boolean> => {
  try {
    const { data } = await API.delete<{
      code: number;
      message: string;
      success: boolean;
    }>(`/history/result/${diagnosisId}`,{
      headers: {
        'Content-Type': 'application/json'
      },
    });

    return data.success;
  } catch (error) {
    console.error('진단 결과 삭제 실패:', error);
    //throw new Error('서버에서 진단 결과 삭제에 실패했습니다.');
  }
};
