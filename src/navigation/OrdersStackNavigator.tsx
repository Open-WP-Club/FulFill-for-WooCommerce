import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {OrdersListScreen} from '../screens/orders/OrdersListScreen';
import {OrderDetailScreen} from '../screens/orders/OrderDetailScreen';
import {PickAndPackScreen} from '../screens/orders/PickAndPackScreen';
import {WavePickScreen} from '../screens/orders/WavePickScreen';
import {useTheme} from '../theme/ThemeContext';
import type {OrdersStackParamList} from '../types/navigation';

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export function OrdersStackNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: theme.primary},
        headerTintColor: theme.textOnPrimary,
        headerTitleStyle: {fontWeight: '600'},
      }}>
      <Stack.Screen
        name="OrdersList"
        component={OrdersListScreen}
        options={{title: 'Orders'}}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{title: 'Order Details'}}
      />
      <Stack.Screen
        name="PickAndPack"
        component={PickAndPackScreen}
        options={{title: 'Pick & Pack'}}
      />
      <Stack.Screen
        name="WavePick"
        component={WavePickScreen}
        options={{title: 'Wave Pick'}}
      />
    </Stack.Navigator>
  );
}
