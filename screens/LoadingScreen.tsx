import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/type';

type Route = RouteProp<RootStackParamList, 'Loading'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Loading'>;

export default function LoadingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<Route>();

  const { recording, diagnosis,diagnosisDate } = route.params;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Result', {
        recordingName: recording.title,
        diagnosisDate,
        prediction1: 87,
        prediction2: 85,
        diagnosis,
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>진단 중입니다...</Text>
      <Image
        source={require('../assets/images/doctor.png')}
        style={styles.image}
      />
      <ActivityIndicator size="large" color="#4CAF50" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
  },
  image: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    marginBottom: 32,
  },
  spinner: { marginTop: 10 },
});
