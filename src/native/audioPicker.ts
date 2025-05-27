import { NativeModules } from 'react-native';

const { AudioPicker, AudioFileCopier } = NativeModules;

export const openAudioPicker = async (): Promise<{ uri: string; name: string }> => {
  const result = await AudioPicker.openAudioPicker();

  return result;
};

export const copySafFileToInternal = async (uri: string): Promise<string> => {
  return await AudioFileCopier.copyToInternal(uri);
}; 