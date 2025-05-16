import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/type';
import { RouteProp } from '@react-navigation/native';
import { Recording } from '../type';

const STORAGE_KEY = '@recordings';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'SelectRecording'>;
type Route = RouteProp<RootStackParamList, 'SelectRecording'>;

export default function SelectRecordingScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<Route>();
  const { gender, diagnosis, diagnosisDate } = route.params;

  const [recordings, setRecordings] = useState<Recording[]>([]);

  useEffect(() => {
    const load = async () => {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const data: Recording[] = JSON.parse(json);
        setRecordings(data);
      }
    };
    load();
  }, []);

  const handleSelect = (recording: Recording) => {
    navigation.navigate('Loading', {
      gender,
      diagnosis,
      recording,
      diagnosisDate,
    });
  };

  const renderItem = ({ item }: { item: Recording }) => {
    const durationSec = Math.floor(Number(item.duration) / 1000);
    return (
      <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)}>
        <Image source={require('../assets/images/mic.png')} style={styles.icon} />
        <View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>{item.createdAt} {durationSec > 0 ? `· ${durationSec}초` : ''}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={recordings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', margin: 16 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f9f9f9', padding: 16,
    borderRadius: 12, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 4, elevation: 2,
  },
  icon: { width: 28, height: 28, marginRight: 12, resizeMode: 'contain' },
  title: { fontSize: 16, fontWeight: '600' },
  date: { fontSize: 12, color: '#666', marginTop: 4 },
});
