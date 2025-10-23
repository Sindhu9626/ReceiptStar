import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Ionicons from '@expo/vector-icons/Ionicons';


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <Ionicons size={30} name="home" color="#cccbff" />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color }) => <Ionicons size={30} name="search" color="#cccbff" />,
        }}
      />

      <Tabs.Screen
        name="camera"
        options={{
        tabBarIcon: ({ color }) => <Ionicons size={30} name="camera" color="#cccbff" />,
        }}
      />

      <Tabs.Screen
        name="data"
        options={{
        tabBarIcon: ({ color }) => <Ionicons size={30} name="menu-outline" color="#cccbff" />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
        tabBarIcon: ({ color }) => <Ionicons size={30} name="person" color="#cccbff" />,
        }}
      />

      

      





    </Tabs>
  );
}
