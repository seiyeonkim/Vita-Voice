import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/type';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Diagnosis'>;

export default function DiagnosisScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selected, setSelected] = useState<'male' | 'female' | null>(null);

  const handleNext = () => {
    if (selected) {
      navigation.navigate('DiagnosisSelect', { gender: selected });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>진단하기</Text>
      <Text style={styles.sub}>성별을 선택하세요.</Text>

      <TouchableOpacity
        style={[styles.card, selected === 'male' && styles.selected]}
        onPress={() => setSelected('male')}
      >
        <Image source={require('../assets/images/male.png')} style={styles.icon} />
        <Text style={styles.label}>남성</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, selected === 'female' && styles.selected]}
        onPress={() => setSelected('female')}
      >
        <Image source={require('../assets/images/female.png')} style={styles.icon} />
        <Text style={styles.label}>여성</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.nextButton, !selected && styles.disabled]}
        disabled={!selected}
        onPress={handleNext}
      >
        <Text style={styles.nextText}>다음</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 40, marginBottom: 12 },
  sub: { fontSize: 18, color: '#888', textAlign: 'center', marginBottom: 32 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  selected: { backgroundColor: '#e0f0ff' },
  icon: { width: 24, height: 24, marginRight: 16, resizeMode: 'contain' },
  label: { fontSize: 16 },
  nextButton: {
    marginTop: 40,
    backgroundColor: '#add8e6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabled: { backgroundColor: '#ccc' },
  nextText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});