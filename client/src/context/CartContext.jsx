import React, { createContext, useContext, useState } from "react";

// Create the cart context
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Cart items array
  // Each item: { _id, name, price, image, quantity, subtotal }
  const [cartItems, setCartItems] = useState([]);

  // Discount percentage entered by cashier
  const [discountPercent, setDiscountPercent] = useState(0);

  // Tax rate (can be changed in settings later, hardcode for now)
  const [taxRate] = useState(0); // set to 6 for 6% SST if needed

  // ─── Add Item to Cart ──────────────────────────────────────────────────────
  const addToCart = (product) => {
    setCartItems((prev) => {
      // Check if product is already in cart
      const existing = prev.find((item) => item._id === product._id);

      if (existing) {
        // If already in cart, just increase quantity by 1
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

      // If not in cart, add as new item with quantity 1
      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
          subtotal: product.price,
        },
      ];
    });
  };

  // ─── Remove Item from Cart ─────────────────────────────────────────────────
  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
  };

  // ─── Update Item Quantity ──────────────────────────────────────────────────
  const updateQuantity = (productId, newQty) => {
    // If quantity goes to 0 or below, remove the item
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

  // ─── Clear Entire Cart ─────────────────────────────────────────────────────
  const clearCart = () => {
    setCartItems([]);
    setDiscountPercent(0);
  };

  // ─── Calculated Values ─────────────────────────────────────────────────────
  // Sum of all item subtotals
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  // Discount amount in RM
  const discountAmount = subtotal * (discountPercent / 100);

  // Amount after discount
  const afterDiscount = subtotal - discountAmount;

  // Tax amount
  const taxAmount = afterDiscount * (taxRate / 100);

  // Final total
  const totalAmount = afterDiscount + taxAmount;

  // Total number of items in cart (sum of all quantities)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        discountPercent,
        setDiscountPercent,
        taxRate,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook for easy access
export const useCart = () => useContext(CartContext);
