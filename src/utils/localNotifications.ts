import notifee, {AndroidImportance} from '@notifee/react-native';

const CHANNEL_ID = 'new-orders';

export async function initNotifications(): Promise<void> {
  await notifee.requestPermission();
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'New Orders',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
}

export async function showNewOrderNotification(
  orderNumber: string,
  customerName: string,
): Promise<void> {
  await notifee.displayNotification({
    title: `New Order #${orderNumber}`,
    body: customerName ? `From ${customerName}` : 'A new order has arrived',
    android: {
      channelId: CHANNEL_ID,
      smallIcon: 'ic_launcher',
      pressAction: {id: 'default'},
      sound: 'default',
    },
    ios: {
      sound: 'default',
    },
  });
}
