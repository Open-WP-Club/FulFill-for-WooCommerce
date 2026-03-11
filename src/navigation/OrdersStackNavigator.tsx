import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {OrdersListScreen} from '../screens/orders/OrdersListScreen';
import {OrderDetailScreen} from '../screens/orders/OrderDetailScreen';
import {PickAndPackScreen} from '../screens/orders/PickAndPackScreen';
import type {OrdersStackParamList} from '../types/navigation';

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export function OrdersStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: '#4F46E5'},
        headerTintColor: '#fff',
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
    </Stack.Navigator>
  );
}
