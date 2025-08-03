import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

export const useCart = () => {
  const [cart, setCart] = useState([]);
  const [toastQueue, setToastQueue] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

// Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("freshmart-cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Ensure cart is always an array
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        } else {
          console.warn("Invalid cart data in localStorage, resetting to empty array");
          setCart([]);
          localStorage.removeItem("freshmart-cart");
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      setCart([]);
      localStorage.removeItem("freshmart-cart");
    } finally {
      setIsInitialized(true);
    }
  }, []);

// Save cart to localStorage whenever it changes (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("freshmart-cart", JSON.stringify(cart));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [cart, isInitialized]);

  // Handle toast notifications after state updates
  useEffect(() => {
    if (toastQueue.length > 0) {
      const currentToast = toastQueue[0];
      if (currentToast.type === 'success') {
        toast.success(currentToast.message);
      } else if (currentToast.type === 'warning') {
        toast.warning(currentToast.message);
      }
      setToastQueue(prev => prev.slice(1));
    }
  }, [toastQueue]);

  const queueToast = useCallback((type, message) => {
    setToastQueue(prev => [...prev, { type, message }]);
  }, []);
const addToCart = useCallback((product, quantity = 1) => {
    const itemId = product.variantId || product.Id;
    const variantText = product.selectedVariant 
      ? ` (${product.selectedVariant.size || product.selectedVariant.weight || product.selectedVariant.color || product.selectedVariant.name})`
      : '';

    setCart(prevCart => {
      const existingItem = prevCart.find(item => 
        (item.variantId || item.Id) === itemId
      );
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          queueToast('warning', `Only ${product.stock} items available in stock`);
          return prevCart;
        }
        
        queueToast('success', `Updated ${product.title}${variantText} quantity in cart`);
        
        return prevCart.map(item =>
          (item.variantId || item.Id) === itemId
            ? { 
                ...item, 
                quantity: newQuantity,
                price: product.price // Update price in case variant changed
              }
            : item
        );
      } else {
        if (quantity > product.stock) {
          queueToast('warning', `Only ${product.stock} items available in stock`);
          return prevCart;
        }
        
        queueToast('success', `${product.title}${variantText} added to cart`);
        
        return [...prevCart, { 
          ...product, 
          quantity,
          variantId: itemId,
          displayName: `${product.title}${variantText}`,
          // Ensure price is correctly set for variant
          price: product.price
        }];
      }
    });
  }, [queueToast]);

const removeFromCart = useCallback((productId) => {
    setCart(prevCart => {
      const item = prevCart.find(item => item.Id === productId);
      if (item) {
        queueToast('success', `${item.title} removed from cart`);
      }
      return prevCart.filter(item => item.Id !== productId);
    });
  }, [queueToast]);

const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => {
      return prevCart.map(item => {
        const itemId = item.variantId || item.Id;
        if (itemId === productId) {
          if (newQuantity > item.stock) {
            queueToast('warning', `Only ${item.stock} items available in stock`);
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  }, [removeFromCart, queueToast]);
const clearCart = useCallback(() => {
    setCart([]);
    queueToast('success', "Cart cleared");
  }, [queueToast]);

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

const getSubtotal = () => {
    return cart.reduce((total, item) => {
      // Use the stored price which includes variant modifications
      const itemPrice = item.price || 0;
      return total + (itemPrice * item.quantity);
    }, 0);
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
    getCartItem,
    isInitialized
  };
};