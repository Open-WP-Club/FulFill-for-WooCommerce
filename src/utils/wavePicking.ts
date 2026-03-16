import type {WcOrder, WcLineItem} from '../types/order';

export interface WaveGroup {
  sku: string;
  productName: string;
  productId: number;
  imageUrl?: string;
  totalQuantity: number;
  orders: Array<{
    orderId: number;
    orderNumber: string;
    lineItemId: number;
    quantity: number;
  }>;
}

export interface Wave {
  id: string;
  orders: WcOrder[];
  groups: WaveGroup[];
  totalItems: number;
  commonSkuCount: number;
}

/**
 * Build consolidated pick list from multiple orders.
 * Groups identical SKUs so the picker walks to each bin once.
 */
export function buildWaveGroups(orders: WcOrder[]): WaveGroup[] {
  const skuMap = new Map<string, WaveGroup>();

  for (const order of orders) {
    for (const item of order.line_items) {
      const key = item.sku || `pid-${item.product_id}`;

      if (skuMap.has(key)) {
        const group = skuMap.get(key)!;
        group.totalQuantity += item.quantity;
        group.orders.push({
          orderId: order.id,
          orderNumber: order.number,
          lineItemId: item.id,
          quantity: item.quantity,
        });
      } else {
        skuMap.set(key, {
          sku: item.sku,
          productName: item.name,
          productId: item.product_id,
          imageUrl: item.image?.src,
          totalQuantity: item.quantity,
          orders: [
            {
              orderId: order.id,
              orderNumber: order.number,
              lineItemId: item.id,
              quantity: item.quantity,
            },
          ],
        });
      }
    }
  }

  // Sort: items appearing in most orders first (most efficient to pick)
  return Array.from(skuMap.values()).sort(
    (a, b) => b.orders.length - a.orders.length || b.totalQuantity - a.totalQuantity,
  );
}

/**
 * Score how well a set of orders fit together for wave picking.
 * Higher = more SKU overlap = more efficient wave.
 */
function waveEfficiency(orders: WcOrder[]): number {
  const skuCounts = new Map<string, number>();
  for (const order of orders) {
    for (const item of order.line_items) {
      const key = item.sku || `pid-${item.product_id}`;
      skuCounts.set(key, (skuCounts.get(key) ?? 0) + 1);
    }
  }
  // Count SKUs that appear in 2+ orders
  let shared = 0;
  for (const count of skuCounts.values()) {
    if (count > 1) {
      shared++;
    }
  }
  return shared;
}

/**
 * Suggest wave groups from a list of orders.
 * Groups orders that share the most common products.
 */
export function suggestWaves(
  orders: WcOrder[],
  maxPerWave: number = 10,
): Wave[] {
  if (orders.length === 0) {
    return [];
  }

  const remaining = [...orders];
  const waves: Wave[] = [];
  let waveIndex = 0;

  while (remaining.length > 0) {
    const wave: WcOrder[] = [remaining.shift()!];

    // Greedily add orders that share the most SKUs with current wave
    while (wave.length < maxPerWave && remaining.length > 0) {
      let bestIdx = -1;
      let bestScore = -1;

      for (let i = 0; i < remaining.length; i++) {
        const candidateWave = [...wave, remaining[i]];
        const score = waveEfficiency(candidateWave);
        if (score > bestScore) {
          bestScore = score;
          bestIdx = i;
        }
      }

      // Only add if there's actual overlap
      if (bestScore > 0 && bestIdx >= 0) {
        wave.push(remaining.splice(bestIdx, 1)[0]);
      } else {
        break;
      }
    }

    const groups = buildWaveGroups(wave);
    waves.push({
      id: `wave-${++waveIndex}`,
      orders: wave,
      groups,
      totalItems: groups.reduce((sum, g) => sum + g.totalQuantity, 0),
      commonSkuCount: groups.filter(g => g.orders.length > 1).length,
    });
  }

  // Sort waves: most efficient first
  return waves.sort((a, b) => b.commonSkuCount - a.commonSkuCount);
}
