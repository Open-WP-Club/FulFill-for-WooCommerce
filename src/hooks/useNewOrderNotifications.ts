import {useEffect, useRef} from 'react';
import {useOrdersStore} from '../stores/ordersStore';
import {useSettingsStore} from '../stores/settingsStore';
import {showNewOrderNotification} from '../utils/localNotifications';
import {formatCustomerName} from '../utils/formatters';

export function useNewOrderNotifications() {
  const knownIdsRef = useRef<Set<number> | null>(null);

  useEffect(() => {
    const unsubscribe = useOrdersStore.subscribe((state, prevState) => {
      const {notificationsEnabled} = useSettingsStore.getState();
      if (!notificationsEnabled) {
        return;
      }

      // Initialize on first load
      if (knownIdsRef.current === null) {
        knownIdsRef.current = new Set(state.orderedIds);
        return;
      }

      // Only detect new orders when orderedIds actually changed
      if (state.orderedIds === prevState.orderedIds) {
        return;
      }

      const newIds = state.orderedIds.filter(
        id => !knownIdsRef.current!.has(id),
      );

      for (const id of newIds) {
        const order = state.orders[id];
        if (order) {
          showNewOrderNotification(
            order.number,
            formatCustomerName(order.billing),
          );
        }
        knownIdsRef.current!.add(id);
      }

      // Also add all current IDs to known set
      for (const id of state.orderedIds) {
        knownIdsRef.current!.add(id);
      }
    });

    return unsubscribe;
  }, []);
}
