import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import api from "../api/axios";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(() => {
    if (!user) {
      setCart(null);
      return;
    }
    setLoading(true);
    api
      .get("/cart")
      .then((res) => setCart(res.data))
      .catch(() => setCart(null))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await api.post("/cart/items", {
      product_id: productId,
      quantity,
    });
    setCart(res.data);
    return res.data;
  };

  const updateItem = async (itemId, quantity) => {
    const res = await api.put(`/cart/items/${itemId}`, { quantity });
    setCart(res.data);
    return res.data;
  };

  const removeItem = async (itemId) => {
    const res = await api.delete(`/cart/items/${itemId}`);
    setCart(res.data);
    return res.data;
  };

  const clearCart = async () => {
    await api.delete("/cart");
    setCart((prev) => (prev ? { ...prev, items: [] } : prev));
  };

  const getItemPrice = useCallback((item) => {
    const rawPrice = Math.max(0, Number(item?.product?.price ?? 0));
    const discount = Math.min(100, Math.max(0, Number(item?.product?.discount ?? 0)));
    if (discount > 0) {
      return Math.max(0, Math.round((rawPrice - (rawPrice * discount) / 100) * 100) / 100);
    }
    return rawPrice;
  }, []);

  const itemCount = cart?.items?.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0) || 0;

  const rawSubtotal =
    cart?.items?.reduce(
      (sum, i) => sum + Math.max(0, Number(i.product?.price ?? 0)) * (Number(i.quantity) || 0),
      0,
    ) || 0;

  const subtotal =
    cart?.items?.reduce(
      (sum, i) => sum + getItemPrice(i) * (Number(i.quantity) || 0),
      0,
    ) || 0;

  const totalDiscount = Math.max(0, rawSubtotal - subtotal);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        subtotal,
        rawSubtotal,
        totalDiscount,
        getItemPrice,
        addToCart,
        updateItem,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
