import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  category: string;
  subcategory?: string;
  imageUrls: string[];
  inStock: boolean;
  stockCount?: number;
  featured: boolean;
  sizes: string[];
  colors: string[];
  tags?: string[];
  homeDelivery?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface CartItem {
  id: string; // unique id combining product id, size, color
  product: Product;
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number, size?: string | null, color?: string | null) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("shahi-cart");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load cart", e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("shahi-cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, quantity: number, size?: string | null, color?: string | null) => {
    setItems((prev) => {
      const id = `${product.id}-${size || "none"}-${color || "none"}`;
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { id, product, quantity, selectedSize: size, selectedColor: color }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setItems([]);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
