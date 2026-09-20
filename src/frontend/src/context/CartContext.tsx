import type { Cart, CartItem, MenuItemId } from "@/backend";
import { useCart } from "@/hooks/use-cart";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";

interface CartContextValue {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  subtotal: bigint;
  deliveryFee: bigint;
  total: bigint;
  restaurantId: bigint | null;
  restaurantName: string | null;
  isEmpty: boolean;
  isLoading: boolean;
  quantityOf: (menuItemId: MenuItemId) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Cart state provider. The backend cart is the source of truth and is
 * re-fetched through React Query, so the cart survives navigation and refresh.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useCart();
  const cart = data ?? null;

  const quantityOf = useCallback(
    (menuItemId: MenuItemId) => {
      const line = cart?.items.find((item) => item.menuItemId === menuItemId);
      return line ? Number(line.quantity) : 0;
    },
    [cart],
  );

  const value = useMemo<CartContextValue>(() => {
    const items = cart?.items ?? [];
    const itemCount = items.reduce(
      (sum, item) => sum + Number(item.quantity),
      0,
    );
    return {
      cart,
      items,
      itemCount,
      subtotal: cart?.subtotal ?? 0n,
      deliveryFee: cart?.deliveryFee ?? 0n,
      total: cart?.total ?? 0n,
      restaurantId: cart?.restaurantId ?? null,
      restaurantName: cart?.restaurantName ?? null,
      isEmpty: items.length === 0,
      isLoading,
      quantityOf,
    };
  }, [cart, isLoading, quantityOf]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
}
