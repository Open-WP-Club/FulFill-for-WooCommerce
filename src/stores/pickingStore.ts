import {create} from 'zustand';
import type {PickSession, PickItem, PickItemStatus} from '../types/picking';
import type {WcOrder} from '../types/order';

interface PickingState {
  activeSession: PickSession | null;

  startSession: (order: WcOrder) => void;
  endSession: () => void;
  updateItemStatus: (
    lineItemId: number,
    status: PickItemStatus,
    pickedQuantity?: number,
  ) => void;
  incrementPicked: (lineItemId: number) => void;
  setItemNote: (lineItemId: number, notes: string) => void;
  setItemPhoto: (lineItemId: number, photoUri: string) => void;
  isSessionComplete: () => boolean;
}

export const usePickingStore = create<PickingState>()((set, get) => ({
  activeSession: null,

  startSession: (order: WcOrder) => {
    const items: PickItem[] = order.line_items.map(li => ({
      lineItemId: li.id,
      productId: li.product_id,
      name: li.name,
      sku: li.sku,
      quantity: li.quantity,
      pickedQuantity: 0,
      status: 'pending' as PickItemStatus,
      imageUrl: li.image?.src,
    }));

    set({
      activeSession: {
        orderId: order.id,
        orderNumber: order.number,
        items,
        startedAt: new Date().toISOString(),
      },
    });
  },

  endSession: () => set({activeSession: null}),

  updateItemStatus: (lineItemId, status, pickedQuantity) => {
    set(state => {
      if (!state.activeSession) {
        return state;
      }
      return {
        activeSession: {
          ...state.activeSession,
          items: state.activeSession.items.map(item =>
            item.lineItemId === lineItemId
              ? {
                  ...item,
                  status,
                  pickedQuantity: pickedQuantity ?? item.pickedQuantity,
                }
              : item,
          ),
        },
      };
    });
  },

  incrementPicked: (lineItemId: number) => {
    set(state => {
      if (!state.activeSession) {
        return state;
      }
      return {
        activeSession: {
          ...state.activeSession,
          items: state.activeSession.items.map(item => {
            if (item.lineItemId !== lineItemId) {
              return item;
            }
            const newPicked = Math.min(
              item.pickedQuantity + 1,
              item.quantity,
            );
            return {
              ...item,
              pickedQuantity: newPicked,
              status:
                newPicked >= item.quantity
                  ? ('picked' as PickItemStatus)
                  : item.status,
            };
          }),
        },
      };
    });
  },

  setItemNote: (lineItemId, notes) => {
    set(state => {
      if (!state.activeSession) {
        return state;
      }
      return {
        activeSession: {
          ...state.activeSession,
          items: state.activeSession.items.map(item =>
            item.lineItemId === lineItemId ? {...item, notes} : item,
          ),
        },
      };
    });
  },

  setItemPhoto: (lineItemId, photoUri) => {
    set(state => {
      if (!state.activeSession) {
        return state;
      }
      return {
        activeSession: {
          ...state.activeSession,
          items: state.activeSession.items.map(item =>
            item.lineItemId === lineItemId ? {...item, photoUri} : item,
          ),
        },
      };
    });
  },

  isSessionComplete: () => {
    const session = get().activeSession;
    if (!session) {
      return false;
    }
    return session.items.every(
      item => item.status === 'picked' || item.status === 'missing' || item.status === 'damaged',
    );
  },
}));
