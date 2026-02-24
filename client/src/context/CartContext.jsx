// client/src/context/CartContext.jsx

import React, { createContext, useContext, useState } from "react";
import { useSettings } from "./SettingsContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Get live tax settings from context
  const { settings } = useSettings();

  // Get enabled taxes sorted by their application order
  const activeTaxes = (settings?.taxes || [])
    .filter((t) => t.enabled)
    .sort((a, b) => a.order - b.order);

  // ─── Cart Actions ──────────────────────────────────────────────────────────
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price,
              }
            : item,
        );
      }
      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
          subtotal: product.price,
          note: "",
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === productId
          ? { ...item, quantity: newQty, subtotal: newQty * item.price }
          : item,
      ),
    );
  };

  // Update the note on an item (e.g. "no onion")
  const updateItemNote = (productId, note) => {
    setCartItems((prev) =>
      prev.map((item) => (item._id === productId ? { ...item, note } : item)),
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscountPercent(0);
  };

  // ─── Compound Tax Calculation ──────────────────────────────────────────────
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const afterDiscount = subtotal - discountAmount;

  // Calculate each tax compounding on previous running total
  let runningTotal = afterDiscount;
  const taxBreakdown = activeTaxes.map((tax) => {
    const base = runningTotal;
    const amount = base * (tax.rate / 100);
    runningTotal += amount; // compound — next tax runs on this new total
    return { name: tax.name, rate: tax.rate, amount, base };
  });

  const totalTaxAmount = taxBreakdown.reduce((sum, t) => sum + t.amount, 0);
  const totalAmount = afterDiscount + totalTaxAmount;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        discountPercent,
        setDiscountPercent,
        activeTaxes,
        taxBreakdown,
        totalTaxAmount,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemNote,
        clearCart,
        subtotal,
        discountAmount,
        totalAmount,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
