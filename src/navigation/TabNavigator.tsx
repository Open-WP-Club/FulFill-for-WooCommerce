import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {OrdersStackNavigator} from './OrdersStackNavigator';
import {ScannerScreen} from '../screens/scanner/ScannerScreen';
import {SettingsScreen} from '../screens/settings/SettingsScreen';
import type {TabParamList} from '../types/navigation';

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopColor: '#E5E7EB',
        },
      }}>
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStackNavigator}
        options={{
          title: 'Orders',
          headerShown: false,
          tabBarIcon: ({color, size}) => (
            <Icon name="list-alt" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ScannerTab"
        component={ScannerScreen}
        options={{
          title: 'Scan',
          headerStyle: {backgroundColor: '#4F46E5'},
          headerTintColor: '#fff',
          tabBarIcon: ({color, size}) => (
            <Icon name="qr-code-scanner" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerStyle: {backgroundColor: '#4F46E5'},
          headerTintColor: '#fff',
          tabBarIcon: ({color, size}) => (
            <Icon name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
