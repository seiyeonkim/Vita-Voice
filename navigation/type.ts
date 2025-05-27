import { Recording } from '../type';

export type RootStackParamList = {
  Splash: undefined;
  Tabs: undefined;
  Home: undefined;
  Record: {
    onRecordComplete?: (recording: Recording) => void;
  };
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
  };
  History: undefined;
  Result: {
    recordingName: string;
    diagnosisDate: string;
    prediction1: number;
    prediction2: number;
    skipSave?: boolean;
    diagnosis: ('parkinson' | 'language')[];
  };
  FAQ: undefined;
  RecordWave: undefined; // ✅ 여기에 추가
};
