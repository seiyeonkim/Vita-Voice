// navigation/type.ts
import { Recording } from '../type';

export type RootStackParamList = {
  Splash: undefined;
  Tabs: undefined;
  Home: undefined;

  // onRecordComplete 콜백은 optional, 파라미터 없이도 허용
  Record: {
    onRecordComplete?: (recording: Recording) => void;
  } | undefined;

  MyRecordings: undefined;
  Diagnosis: undefined;
  DiagnosisSelect: {
    gender: 'male' | 'female';
  };
  SelectRecording: {
    gender: 'male' | 'female';
    diagnosis: ('parkinson' | 'language')[];
    diagnosisDate: string;
  };
  Loading: {
    gender: 'male' | 'female';
    diagnosis: ('parkinson' | 'language')[];
    diagnosisDate: string;
    recording: Recording;
    fileId: string;
  };
  History: undefined;
  Result: {
    recordingName: string;
    diagnosisDate: string;
    prediction1: number;
    prediction2: number;
    skipSave?: boolean;
    diagnosis: ('parkinson' | 'language')[];
    duration: number;
  };
  FAQ: undefined;
  RecordWave: undefined;
};
