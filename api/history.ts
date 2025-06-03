import api from './axios';



export type HistoryItem = {
  diagnosisId: number;
  fileId: string;
  fileName: string;
  uploadTime: string;
};

/**
 * 진단 기록 목록을 서버에서 가져옵니다.
 */
export const fetchHistoryList = async (): Promise<HistoryItem[]> => {
  try {
    const response = await api.get('/history/list');

    // 응답 데이터 확인 로그
    console.log('✅ 서버 응답 성공:', response.data);

    return response.data; // 또는 response.data.data 구조에 맞게 수정
  } catch (err: any) {
    console.log('❌ 네트워크 오류:', err.message);
    if (err.config) console.log('요청 URL:', err.config.url);
    if (err.code) console.log('에러 코드:', err.code);
    throw err;
  }
};
