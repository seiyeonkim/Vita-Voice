import { Recording } from '../type';

export type RootStackParamList = {
  Home: undefined;
  Record: {
    onRecordComplete?: (recording: Recording) => void;
  };
  Detail: {
    recording: Recording;
    onRename: (newTitle: string) => void;
    onDelete: () => void;
  };
  Diagnosis: undefined; // ✅ 성별 선택 화면 키로 추가
  DiagnosisSelect: { gender: 'male' | 'female' }; // ✅ 진단 항목 화면으로 성별 전달
  NextStep: { 
    diagnosis: ('parkinson' | 'language')[]; // ✅ 배열로 변경: 다중 선택 지원
  };
};
