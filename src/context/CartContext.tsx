import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Beat, BeatPack } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Beat | BeatPack, type: 'beat' | 'pack') => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  isInCart: (id: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cashmere_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('cashmere_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const addToCart = (item: Beat | BeatPack, type: 'beat' | 'pack') => {
    if (items.some(i => i.id === item.id)) return;

    const newItem: CartItem = {
      id: item.id,
      type,
      item,
      price: item.isFree ? 0 : item.price
    };

    setItems(prev => [...prev, newItem]);
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (id: string) => {
    return items.some(i => i.id === id);
  };

  const subtotal = items.reduce((sum, i) => sum + i.price, 0);
  const totalItems = items.length;

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      clearCart,
      subtotal,
      totalItems,
      isCheckoutOpen,
      openCheckout: () => setIsCheckoutOpen(true),
      closeCheckout: () => setIsCheckoutOpen(false),
      isInCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
