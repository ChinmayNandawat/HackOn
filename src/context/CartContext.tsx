"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string; // unique key in cart, e.g., `${product.id}-${selectedSize || 'default'}`
  product: any;
  selectedSize?: string;
  quantity: number;
  price: number;
  isLocalDeal?: boolean;
}

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: any, selectedSize?: string, customPrice?: number, isLocalDeal?: boolean) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateSize: (cartItemId: string, newSize: string) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  greenCreditsEarned: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("relife_cart_items");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to parse cart items from localStorage", e);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("relife_cart_items", JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart items to localStorage", e);
    }
  }, [items, isInitialized]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const addToCart = (product: any, selectedSize?: string, customPrice?: number, isLocalDeal?: boolean) => {
    const isRefurb = product.condition === "refurbished" || product.is_refurbished;
    const price = customPrice ?? ((isRefurb ? product.estimated_resale_price : product.original_price) || product.current_price || 0);
    const sizeKey = selectedSize || "default";
    const itemId = `${product.id}-${sizeKey}`;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === itemId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: itemId,
            product,
            selectedSize,
            quantity: 1,
            price,
            isLocalDeal,
          },
        ];
      }
    });
    openCart();
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const updateSize = (cartItemId: string, newSize: string) => {
    setItems((prev) => {
      const targetItem = prev.find((item) => item.id === cartItemId);
      if (!targetItem) return prev;

      const newId = `${targetItem.product.id}-${newSize}`;
      const existingWithNewSize = prev.find((item) => item.id === newId && item.id !== cartItemId);

      if (existingWithNewSize) {
        // Merge quantities if the target size already exists in the cart
        return prev
          .filter((item) => item.id !== cartItemId)
          .map((item) =>
            item.id === newId
              ? { ...item, quantity: item.quantity + targetItem.quantity, selectedSize: newSize }
              : item
          );
      } else {
        // Simply change the size and id
        return prev.map((item) =>
          item.id === cartItemId
            ? { ...item, id: newId, selectedSize: newSize }
            : item
        );
      }
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Calculate Green Credits: e.g. 30 credits per refurbished item
  const greenCreditsEarned = items.reduce((sum, item) => {
    const isRefurb = item.product.condition === "refurbished" || item.product.is_refurbished;
    return sum + (isRefurb ? 30 * item.quantity : 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateSize,
        clearCart,
        totalCount,
        subtotal,
        greenCreditsEarned,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
