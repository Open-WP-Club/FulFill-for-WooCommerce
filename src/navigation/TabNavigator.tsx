import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from '@react-native-vector-icons/material-icons';
import {OrdersStackNavigator} from './OrdersStackNavigator';
import {ScannerScreen} from '../screens/scanner/ScannerScreen';
import {AnalyticsDashboardScreen} from '../screens/analytics/AnalyticsDashboardScreen';
import {SettingsScreen} from '../screens/settings/SettingsScreen';
import {useTheme} from '../theme/ThemeContext';
import type {TabParamList} from '../types/navigation';

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.tabBarBg,
          borderTopColor: theme.tabBarBorder,
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
          headerStyle: {backgroundColor: theme.primary},
          headerTintColor: theme.textOnPrimary,
          tabBarIcon: ({color, size}) => (
            <Icon name="qr-code-scanner" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AnalyticsTab"
        component={AnalyticsDashboardScreen}
        options={{
          title: 'Analytics',
          headerStyle: {backgroundColor: theme.primary},
          headerTintColor: theme.textOnPrimary,
          tabBarIcon: ({color, size}) => (
            <Icon name="bar-chart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerStyle: {backgroundColor: theme.primary},
          headerTintColor: theme.textOnPrimary,
          tabBarIcon: ({color, size}) => (
            <Icon name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
