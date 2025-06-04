import API from '../api';

// audioFileUri: React Native 파일 URI (ex: from react-native-document-picker, react-native-audio 등)
// metadata: JS 객체, 예: { userId: '123', description: '녹음 파일' } 등

export const uploadDiagnosis = async (audioFileUri: string, metadata: object) => {
  const fileUri = audioFileUri.startsWith('file://') ? audioFileUri : `file://${audioFileUri}`;
  const formData = new FormData();
  
  console.log('uploadDiagnosis - fileUri:', fileUri);
  console.log('metadata:', metadata);
  console.log('metadata JSON:', JSON.stringify(metadata));
  // React Native에서는 파일 객체를 이렇게 만듭니다.
  formData.append('audioFile', {
    uri: fileUri,
    type: 'audio/wav',  // 실제 파일 타입에 맞게 변경하세요
    name: 'record.wav',  // 파일 이름 지정
  } as any);

  formData.append('metadata', JSON.stringify(metadata));

  try {
    const response = await API.post('/diagnosis/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });

    return response.data; // 서버 응답 전체
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
