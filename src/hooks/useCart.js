import { useState, useEffect } from "react";
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
      const existingItem = prevCart.find(item => item.Id === product.Id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          toast.warning(`Only ${product.stock} items available in stock`);
          return prevCart;
        }
        
        toast.success(`Updated ${product.title} quantity in cart`);
        return prevCart.map(item =>
          item.Id === product.Id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        if (quantity > product.stock) {
          toast.warning(`Only ${product.stock} items available in stock`);
          return prevCart;
        }
        
        toast.success(`${product.title} added to cart`);
        return [...prevCart, { ...product, quantity }];
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
        if (item.Id === productId) {
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

  const isInCart = (productId) => {
    return cart.some(item => item.Id === productId);
  };

  const getCartItem = (productId) => {
    return cart.find(item => item.Id === productId);
  };

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