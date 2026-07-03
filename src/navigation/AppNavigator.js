import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTripStore } from '../store/useTripStore';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

// Screens import
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import HomeScreen from '../screens/Global/HomeScreen';
import FriendsGlobalScreen from '../screens/Global/FriendsGlobalScreen';
import MyPageGlobalScreen from '../screens/Global/MyPageGlobalScreen';

import DashboardScreen from '../screens/Detail/DashboardScreen';
import TimelineScreen from '../screens/Detail/TimelineScreen';
import ChatScreen from '../screens/Detail/ChatScreen';
import ChecklistExpenseScreen from '../screens/Detail/ChecklistExpenseScreen';
import TripFriendsScreen from '../screens/Detail/TripFriendsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 1. 비인증 스택 (Auth Stack)
function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// 2. 글로벌 탭 내비게이터 (Main Tabs - 3개 탭)
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.card,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTitleStyle: {
          fontSize: 14,
          fontWeight: 'bold',
          color: theme.colors.text,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: 'bold',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'FriendsTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'MyPageTab') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: '나의 여행' }} />
      <Tab.Screen name="FriendsTab" component={FriendsGlobalScreen} options={{ title: '친구' }} />
      <Tab.Screen name="MyPageTab" component={MyPageGlobalScreen} options={{ title: '마이' }} />
    </Tab.Navigator>
  );
}

// 3. 여행 상세 전용 탭 내비게이터 (Trip Detail Tabs - 6개 탭)
function TripDetailTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.card,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTitleStyle: {
          fontSize: 13,
          fontWeight: 'bold',
          color: theme.colors.text,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 8,
          fontWeight: 'bold',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home-sharp' : 'home-outline';
          } else if (route.name === 'Timeline') {
            iconName = focused ? 'git-commit' : 'git-commit-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline';
          } else if (route.name === 'Checklist/Expense') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'TripFriends') {
            iconName = focused ? 'people-sharp' : 'people-outline';
          } else if (route.name === 'MyPage') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }
          return <Ionicons name={iconName} size={size - 2} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: '대시보드' }} />
      <Tab.Screen name="Timeline" component={TimelineScreen} options={{ title: '타임라인' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: '친구채팅' }} />
      <Tab.Screen name="Checklist/Expense" component={ChecklistExpenseScreen} options={{ title: '정산/준비' }} />
      <Tab.Screen name="TripFriends" component={TripFriendsScreen} options={{ title: '친구' }} />
      <Tab.Screen name="MyPage" component={MyPageGlobalScreen} options={{ title: '마이' }} />
    </Tab.Navigator>
  );
}

// 4. 루트 내비게이터 (Root Navigator - 조건부 렌더링)
export default function AppNavigator() {
  const currentUser = useTripStore(state => state.currentUser);
  const activeTripId = useTripStore(state => state.activeTripId);

  // 1단계: 로그인하지 않았다면 Auth Stack 표출
  if (!currentUser) {
    return <AuthNavigator />;
  }

  // 2단계: 여행 상세가 선택되었다면 6개 탭의 Trip Detail Tabs 표출
  if (activeTripId !== null) {
    return <TripDetailTabNavigator />;
  }

  // 3단계: 기본 상태일 땐 3개 탭의 Global Main Tabs 표출
  return <MainTabNavigator />;
}
