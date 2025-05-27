// types.ts
export type Recording = {
  id: string;
  title: string;
  createdAt: string;
  duration: number | string;
  uri: string;        // 필수
  path: string;      // 선택
};
