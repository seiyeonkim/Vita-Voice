import API from '../api';
import { AxiosError } from 'axios';

export type AnalyzeRequest = {
    fileId: string;
    gender: 'male' | 'female';
    mode: string; // 예: 'quick' | 'detailed'
  };
  
  export type AnalyzeResponse = {
    code: number;
    message: string;
    data: {
      prediction: number;
      probabilities: number[];
      label: string | null;
      analyzedAt: string;
    };
    success: boolean;
  };
  
  export const analyzeDiagnosis = async (
    request: AnalyzeRequest
  ): Promise<AnalyzeResponse> => {
    try {
      const response = await API.post<AnalyzeResponse>('/diagnosis/analyze', request, {
        headers: {
            'Content-Type': 'application/json'
          },
      });
      return response.data;
    } catch (error) {
        const err = error as AxiosError;
        console.error('진단 요청 실패:', err.message, err.response?.data);
        throw err;
    }
  };