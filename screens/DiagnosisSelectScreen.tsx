import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/type';
import { RouteProp } from '@react-navigation/native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DiagnosisSelect'>;
type RouteType = RouteProp<RootStackParamList, 'DiagnosisSelect'>;

export default function DiagnosisSelectScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const gender = route.params.gender;

  const [selected, setSelected] = useState<('parkinson' | 'language')[]>([]);

  const toggleSelect = (item: 'parkinson' | 'language') => {
    setSelected(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleNext = () => {
  const diagnosisDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  navigation.navigate('SelectRecording', {
    gender,
    diagnosis: selected,
    diagnosisDate, 
  });
};


  return (
    <View style={styles.container}>
      <Text style={styles.header}>진단하기</Text>
      <Text style={styles.subHeader}>진단할 항목을 선택하세요.</Text>

      <TouchableOpacity
        style={[styles.card, selected.includes('parkinson') && styles.selectedCard]}
        onPress={() => toggleSelect('parkinson')}
      >
        <Image source={require('../assets/images/brain.png')} style={styles.icon} />
        <View>
          <Text style={styles.title}>파킨슨병</Text>
          <Text style={styles.desc}>신경퇴행성 질환 검사</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, selected.includes('language') && styles.selectedCard]}
        onPress={() => toggleSelect('language')}
      >
        <Image source={require('../assets/images/language.png')} style={styles.icon} />
        <View>
          <Text style={styles.title}>성대 질환</Text>
          <Text style={styles.desc}>성대결절, 성대 마비, 후두염 등 음성질환 검사</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.nextBtn, selected.length === 0 && { backgroundColor: '#ccc' }]}
        onPress={handleNext}
        disabled={selected.length === 0}
      >
        <Text style={styles.nextText}>다음</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subHeader: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  selectedCard: {
    borderColor: '#48A6A7',
    borderWidth: 2,
  },
  icon: { width: 48, height: 48, marginRight: 16, resizeMode: 'contain' },
  title: { fontSize: 16, fontWeight: '600' },
  desc: { fontSize: 12, color: '#666' },
  nextBtn: {
    marginTop: 32,
    backgroundColor: '#9ACBD0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextText: { color: '#fff', fontWeight: '600' },
});
