import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

export const useCart = () => {
const [cart, setCart] = useState([]);
  const [toastQueue, setToastQueue] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);

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
const addToCart = useCallback(async (product, quantity = 1) => {
    if (loading) return;
    
    setLoading(true);
    try {
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
          if (newQuantity > (product.stock || 99)) {
            queueToast('warning', `Only ${product.stock || 99} items available in stock`);
            return prevCart;
          }
          
          queueToast('success', `Updated ${product.title}${variantText} quantity in cart`);
          
          const updatedCart = prevCart.map(item =>
            (item.variantId || item.Id) === itemId
              ? { 
                  ...item, 
                  quantity: newQuantity,
                  price: product.price
                }
              : item
          );
          
          // Save to localStorage
          localStorage.setItem('cart', JSON.stringify(updatedCart));
          return updatedCart;
        } else {
          if (quantity > (product.stock || 99)) {
            queueToast('warning', `Only ${product.stock || 99} items available in stock`);
            return prevCart;
          }
          
          queueToast('success', `${product.title}${variantText} added to cart`);
          
          const newCart = [...prevCart, { 
            ...product, 
            quantity,
            variantId: itemId,
            displayName: `${product.title}${variantText}`,
            price: product.price
          }];
          
          // Save to localStorage
          localStorage.setItem('cart', JSON.stringify(newCart));
          return newCart;
        }
      });
    } finally {
      setLoading(false);
    }
  }, [queueToast, loading]);

const removeFromCart = useCallback(async (productId) => {
    if (loading) return;
    
    setLoading(true);
    try {
      setCart(prevCart => {
        const item = prevCart.find(item => (item.variantId || item.Id) === productId);
        if (item) {
          queueToast('success', `${item.displayName || item.title} removed from cart`);
        }
        
        const updatedCart = prevCart.filter(item => (item.variantId || item.Id) !== productId);
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
      });
    } finally {
      setLoading(false);
    }
  }, [queueToast, loading]);

const updateQuantity = useCallback(async (productId, newQuantity) => {
    if (loading) return;
    
    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    setLoading(true);
    try {
      setCart(prevCart => {
        const updatedCart = prevCart.map(item => {
          const itemId = item.variantId || item.Id;
          if (itemId === productId) {
            const maxStock = item.stock || 99;
            if (newQuantity > maxStock) {
              queueToast('warning', `Only ${maxStock} items available in stock`);
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
      });
    } finally {
      setLoading(false);
    }
  }, [removeFromCart, queueToast, loading]);
const clearCart = useCallback(async (skipConfirmation = false) => {
    if (loading) return;
    
    if (!skipConfirmation && cart.length > 0) {
      const confirmed = window.confirm('Are you sure you want to clear your cart? This action cannot be undone.');
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      setCart([]);
      localStorage.removeItem('cart');
      queueToast('success', "Cart cleared");
    } finally {
      setLoading(false);
    }
  }, [queueToast, loading, cart.length]);

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
    isInitialized,
    loading
  };
};