// src/services/faq.ts
import API from '../api';

export interface FaqDto {
  id: number;
  question: string;
  answer: string;
  createdAt: string;
}

/**
 * FAQ 전체 목록 조회
 */
export const listFaqs = async (): Promise<FaqDto[]> => {
  const { data } = await API.get<FaqDto[]>('/faq/list');
  return data;
};

/**
 * 새 FAQ 추가
 * @param payload.question 질문
 * @param payload.answer 답변
 */
export const addFaq = async (payload: {
  question: string;
  answer: string;
}): Promise<FaqDto> => {
  const { data } = await API.post<FaqDto>('/faq/add', payload);
  return data;
};

/**
 * 기존 FAQ 수정
 * @param id 수정할 FAQ ID
 * @param payload.question 질문
 * @param payload.answer 답변
 */
export const updateFaq = async (
  id: number,
  payload: { question: string; answer: string }
): Promise<FaqDto> => {
  const { data } = await API.patch<FaqDto>(`/faq/${id}`, payload);
  return data;
};

/**
 * FAQ 삭제
 * @param id 삭제할 FAQ ID
 */
export const deleteFaq = async (id: number): Promise<void> => {
  await API.delete(`/faq/${id}`);
};
