import type {WcOrder} from './order';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export type TabParamList = {
  OrdersTab: undefined;
  ScannerTab: undefined;
  SettingsTab: undefined;
};

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetail: {orderId: number};
  PickAndPack: {order: WcOrder};
};
