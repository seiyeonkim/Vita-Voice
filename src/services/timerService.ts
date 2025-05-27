// src/services/timerService.ts

/**
 * 지정된 시간만큼 대기합니다.
 * @param ms 대기할 시간(밀리초)
 */
export const wait = async (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
