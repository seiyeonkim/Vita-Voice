import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image } from 'react-native';

import HomeScreen from './HomeScreen';
import RecordScreen from './components/RecordScreen';
import DiagnosisScreen from './screens/DiagnosisScreen';
import DiagnosisSelectScreen from './screens/DiagnosisSelectScreen'; // 진단 항목 선택 화면
import { RootStackParamList } from './navigation/type'; // 네비게이션 타입 정의

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Record" component={RecordScreen} />
  </Stack.Navigator>
);

const DiagnosisStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Diagnosis" component={DiagnosisScreen} />
    <Stack.Screen name="DiagnosisSelect" component={DiagnosisSelectScreen} />
    {/* 추후에 NextStep 화면 등 추가 가능 */}
  </Stack.Navigator>
);

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen
          name="홈"
          component={HomeStack}
          options={{
            tabBarIcon: () => (
              <Image source={require('./assets/images/home.png')} style={{ width: 24, height: 24 }} />
            ),
          }}
        />
        <Tab.Screen
          name="진단하기"
          component={DiagnosisStack}
          options={{
            tabBarIcon: () => (
              <Image source={require('./assets/images/list.png')} style={{ width: 24, height: 24 }} />
            ),
          }}
        />
        <Tab.Screen
          name="내 정보"
          component={() => <></>}
          options={{
            tabBarIcon: () => (
              <Image source={require('./assets/images/user.png')} style={{ width: 24, height: 24 }} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
