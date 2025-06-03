import api from './axios';

export const analyzeDiagnosis = async (fileId: string) => {
  try {
    const response = await api.post('/diagnosis/analyze', {
      fileId: fileId,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 분석 요청 실패:', error);
    throw error;
  }
};
