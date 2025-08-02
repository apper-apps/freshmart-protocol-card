import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
export const useCart = () => {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("freshmart-cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("freshmart-cart", JSON.stringify(cart));
  }, [cart]);

const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const itemId = product.variantId || product.Id;
      const existingItem = prevCart.find(item => 
        (item.variantId || item.Id) === itemId
      );
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          toast.warning(`Only ${product.stock} items available in stock`);
          return prevCart;
        }
        
        const variantText = product.selectedVariant 
          ? ` (${product.selectedVariant.size || product.selectedVariant.weight || product.selectedVariant.color || product.selectedVariant.name})`
          : '';
        toast.success(`Updated ${product.title}${variantText} quantity in cart`);
        
        return prevCart.map(item =>
          (item.variantId || item.Id) === itemId
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        if (quantity > product.stock) {
          toast.warning(`Only ${product.stock} items available in stock`);
          return prevCart;
        }
        
        const variantText = product.selectedVariant 
          ? ` (${product.selectedVariant.size || product.selectedVariant.weight || product.selectedVariant.color || product.selectedVariant.name})`
          : '';
        toast.success(`${product.title}${variantText} added to cart`);
        
        return [...prevCart, { 
          ...product, 
          quantity,
          variantId: itemId,
          displayName: `${product.title}${variantText}`
        }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const item = prevCart.find(item => item.Id === productId);
      if (item) {
        toast.success(`${item.title} removed from cart`);
      }
      return prevCart.filter(item => item.Id !== productId);
    });
  };

const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => {
      return prevCart.map(item => {
        const itemId = item.variantId || item.Id;
        if (itemId === productId) {
          if (newQuantity > item.stock) {
            toast.warning(`Only ${item.stock} items available in stock`);
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };
  const clearCart = () => {
    setCart([]);
    toast.success("Cart cleared");
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

const isInCart = useCallback((productId) => {
    return cart.some(item => (item.variantId || item.Id) === productId);
  }, [cart]);

  const getCartItem = useCallback((productId) => {
    return cart.find(item => (item.variantId || item.Id) === productId);
  }, [cart]);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getSubtotal,
    isInCart,
    getCartItem
  };
};