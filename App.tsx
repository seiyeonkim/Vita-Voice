import React from 'react';
import { Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation/type';

import HomeScreen from './HomeScreen';
import RecordScreen from './components/RecordScreen';
import DiagnosisScreen from './screens/DiagnosisScreen';
import DiagnosisSelectScreen from './screens/DiagnosisSelectScreen';
import SelectRecordingScreen from './screens/SelectRecordingScreen';
import LoadingScreen from './screens/LoadingScreen';
import DiagnosisResultScreen from './screens/DiagnosisResultScreen'; // ✅ 결과화면
import HistoryScreen from './screens/HistoryScreen';
import FAQScreen from './screens/FAQScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Record" component={RecordScreen} />
  </Stack.Navigator>
);

const DiagnosisStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Diagnosis" component={DiagnosisScreen} options={{ headerShown: false }} />
    <Stack.Screen name="DiagnosisSelect" component={DiagnosisSelectScreen} options={{ title: '' }} />
    <Stack.Screen name="SelectRecording" component={SelectRecordingScreen} options={{ title: '' }} />
    <Stack.Screen name="Loading" component={LoadingScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen
      name="홈"
      component={HomeStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <Image
            source={
              focused
                ? require('./assets/images/home(1).png')
                : require('./assets/images/home.png')
            }
            style={{ width: 24, height: 24, resizeMode: 'contain', marginBottom: -2 }}
          />
        ),
      }}
    />
    <Tab.Screen
      name="진단하기"
      component={DiagnosisStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <Image
            source={
              focused
                ? require('./assets/images/diagnosis(1).png')
                : require('./assets/images/diagnosis.png')
            }
            style={{ width: 24, height: 24, resizeMode: 'contain', marginBottom: -2 }}
          />
        ),
      }}
    />
    <Tab.Screen
      name="진단 기록"
      component={HistoryScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <Image
            source={
              focused
                ? require('./assets/images/history(1).png')
                : require('./assets/images/history.png')
            }
            style={{ width: 24, height: 24, resizeMode: 'contain', marginBottom: -2 }}
          />
        ),
      }}
    />
    <Tab.Screen
      name="FAQ"
      component={FAQScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <Image
            source={
              focused
                ? require('./assets/images/faq(1).png')
                : require('./assets/images/faq.png')
            }
            style={{ width: 24, height: 24, resizeMode: 'contain', marginBottom: -2 }}
          />
        ),
      }}
    />
  </Tab.Navigator>
);

export default function App() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Tabs" component={MainTabs} />
        <RootStack.Screen name="Result" component={DiagnosisResultScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
