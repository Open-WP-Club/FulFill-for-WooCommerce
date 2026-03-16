import notifee, {
  AndroidImportance,
  TriggerType,
  RepeatFrequency,
} from '@notifee/react-native';
import {fetchOrderCounts} from '../api/orders';

const CHANNEL_ID = 'new-orders';
const SUMMARY_CHANNEL_ID = 'daily-summary';

export async function initNotifications(): Promise<void> {
  await notifee.requestPermission();
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'New Orders',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
  await notifee.createChannel({
    id: SUMMARY_CHANNEL_ID,
    name: 'Daily Summary',
    importance: AndroidImportance.DEFAULT,
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

export async function scheduleDailySummary(hour: number = 8): Promise<void> {
  // Cancel any existing daily summary triggers
  const triggers = await notifee.getTriggerNotificationIds();
  for (const id of triggers) {
    if (id.startsWith('daily-summary')) {
      await notifee.cancelTriggerNotification(id);
    }
  }

  const now = new Date();
  const target = new Date();
  target.setHours(hour, 0, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  await notifee.createTriggerNotification(
    {
      id: 'daily-summary',
      title: 'Good morning!',
      body: 'Tap to see your pending orders for today.',
      android: {
        channelId: SUMMARY_CHANNEL_ID,
        smallIcon: 'ic_launcher',
        pressAction: {id: 'default'},
      },
      ios: {
        sound: 'default',
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: target.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    },
  );
}

export async function showDailySummaryNow(): Promise<void> {
  try {
    const counts = await fetchOrderCounts();
    const processing = counts.processing ?? 0;
    const pending = counts.pending ?? 0;
    const onHold = counts['on-hold'] ?? 0;
    const total = processing + pending + onHold;

    await notifee.displayNotification({
      title: 'Daily Order Summary',
      body: `${total} orders need attention: ${processing} processing, ${pending} pending, ${onHold} on hold`,
      android: {
        channelId: SUMMARY_CHANNEL_ID,
        smallIcon: 'ic_launcher',
        pressAction: {id: 'default'},
      },
      ios: {
        sound: 'default',
      },
    });
  } catch {
    // Silently fail if API is unavailable
  }
}

export async function cancelDailySummary(): Promise<void> {
  await notifee.cancelTriggerNotification('daily-summary');
}
