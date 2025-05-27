// src/services/preferencesService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const GENDER_KEY = '@selected_gender';

/**
 * 성별을 AsyncStorage에 저장합니다.
 */
export const saveGender = async (gender: 'male' | 'female'): Promise<void> => {
  await AsyncStorage.setItem(GENDER_KEY, gender);
};

/**
 * 이전에 저장한 성별을 불러옵니다.
 */
export const loadGender = async (): Promise<'male' | 'female' | null> => {
  const value = await AsyncStorage.getItem(GENDER_KEY);
  return value === 'male' || value === 'female' ? value : null;
};
