import {useState, useEffect} from 'react';
import {fetchProductStock} from '../api/inventory';

interface ProductStockResult {
  stockQuantity: number | null;
  stockStatus: string;
  isLoading: boolean;
}

const stockCache: Record<
  number,
  {quantity: number | null; status: string; fetchedAt: number}
> = {};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function useProductStock(productId: number): ProductStockResult {
  const cached = stockCache[productId];
  const isFresh = cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS;

  const [stockQuantity, setStockQuantity] = useState<number | null>(
    isFresh ? cached.quantity : null,
  );
  const [stockStatus, setStockStatus] = useState(
    isFresh ? cached.status : 'instock',
  );
  const [isLoading, setIsLoading] = useState(!isFresh);

  useEffect(() => {
    if (isFresh) {
      return;
    }

    let cancelled = false;
    fetchProductStock(productId)
      .then(result => {
        if (!cancelled) {
          setStockQuantity(result.stock_quantity);
          setStockStatus(result.stock_status);
          stockCache[productId] = {
            quantity: result.stock_quantity,
            status: result.stock_status,
            fetchedAt: Date.now(),
          };
        }
      })
      .catch(() => {
        // Silently fail - stock info is non-critical
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [productId, isFresh]);

  return {stockQuantity, stockStatus, isLoading};
}
