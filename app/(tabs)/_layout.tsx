
import React from 'react';
import { Platform } from 'react-native';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { userRole, isManager } = useAuth();

  // Customer tabs - simplified navigation
  const customerTabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'house.fill',
      label: 'Home',
    },
    {
      name: 'menu',
      route: '/(tabs)/menu',
      icon: 'book.fill',
      label: 'Menu',
    },
    {
      name: 'events',
      route: '/(tabs)/events',
      icon: 'calendar',
      label: 'Events',
    },
    {
      name: 'about',
      route: '/(tabs)/about',
      icon: 'info.circle.fill',
      label: 'About',
    },
    {
      name: 'gallery',
      route: '/(tabs)/gallery',
      icon: 'photo.fill',
      label: 'Gallery',
    },
  ];

  // Employee tabs
  const employeeTabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'house.fill',
      label: 'Home',
    },
    {
      name: 'training',
      route: '/(tabs)/training',
      icon: 'book.fill',
      label: 'Training',
    },
    {
      name: 'rewards',
      route: '/(tabs)/rewards',
      icon: 'star.fill',
      label: 'Rewards',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person.fill',
      label: 'Profile',
    },
  ];

  // Manager tabs - comprehensive management
  const managerTabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'house.fill',
      label: 'Home',
    },
    {
      name: 'manager',
      route: '/(tabs)/manager',
      icon: 'wrench.and.screwdriver.fill',
      label: 'Manage',
    },
    {
      name: 'employees',
      route: '/(tabs)/employees',
      icon: 'person.2.fill',
      label: 'Staff',
    },
    {
      name: 'training',
      route: '/(tabs)/training',
      icon: 'book.fill',
      label: 'Training',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person.fill',
      label: 'Profile',
    },
  ];

  const tabs = 
    userRole === 'manager' ? managerTabs :
    userRole === 'employee' ? employeeTabs : 
    customerTabs;

  // Use NativeTabs for iOS, custom FloatingTabBar for Android and Web
  if (Platform.OS === 'ios') {
    return (
      <NativeTabs>
        {tabs.map((tab) => (
          <NativeTabs.Trigger key={tab.name} name={tab.name}>
            <Icon sf={tab.icon} drawable={`ic_${tab.name}`} />
            <Label>{tab.label}</Label>
          </NativeTabs.Trigger>
        ))}
      </NativeTabs>
    );
  }

  // For Android and Web, use Stack navigation with custom floating tab bar
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="(home)" />
        <Stack.Screen name="menu" />
        <Stack.Screen name="events" />
        <Stack.Screen name="about" />
        <Stack.Screen name="gallery" />
        <Stack.Screen name="rewards" />
        <Stack.Screen name="training" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="manager" />
        <Stack.Screen name="employees" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
