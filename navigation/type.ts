import { Recording } from '../type';

export type RootStackParamList = {
  Tabs: undefined;
  Home: undefined;
  Record: {
    onRecordComplete?: (recording: Recording) => void;
  };
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
  MainTabs: undefined;
  History: undefined;
  Result: {
    recordingName: string;
    diagnosisDate: string;
    prediction1: number;
    prediction2: number;
    diagnosis: ('parkinson' | 'language')[];
  };
  FAQ: undefined;
};
