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
    if (loading) return Promise.resolve();
    
    return new Promise((resolve) => {
      setLoading(true);
      
      const itemId = product.variantId || product.Id;
      const variantText = product.selectedVariant 
        ? ` (${product.selectedVariant.size || product.selectedVariant.weight || product.selectedVariant.color || product.selectedVariant.name})`
        : '';

      setCart(prevCart => {
        const existingItem = prevCart.find(item => 
          (item.variantId || item.Id) === itemId
        );
        
        let updatedCart;
        
        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          if (newQuantity > (product.stock || 99)) {
            queueToast('warning', `Only ${product.stock || 99} items available in stock`);
            setLoading(false);
            resolve();
            return prevCart;
          }
          
          queueToast('success', `Updated ${product.title}${variantText} quantity in cart`);
          
          updatedCart = prevCart.map(item =>
            (item.variantId || item.Id) === itemId
              ? { 
                  ...item, 
                  quantity: newQuantity,
                  price: product.price
                }
              : item
          );
        } else {
          if (quantity > (product.stock || 99)) {
            queueToast('warning', `Only ${product.stock || 99} items available in stock`);
            setLoading(false);
            resolve();
            return prevCart;
          }
          
          queueToast('success', `${product.title}${variantText} added to cart`);
          
          updatedCart = [...prevCart, { 
            ...product, 
            quantity,
            variantId: itemId,
            displayName: `${product.title}${variantText}`,
            price: product.price
          }];
        }
        
        // Single localStorage write after state update
        requestAnimationFrame(() => {
          try {
            localStorage.setItem('freshmart-cart', JSON.stringify(updatedCart));
          } catch (error) {
            console.error('Error saving cart:', error);
          }
          setLoading(false);
          resolve();
        });
        
        return updatedCart;
      });
    });
  }, [queueToast, loading]);

const removeFromCart = useCallback(async (productId) => {
    if (loading) return Promise.resolve();
    
    return new Promise((resolve) => {
      setLoading(true);
      
      setCart(prevCart => {
        const item = prevCart.find(item => (item.variantId || item.Id) === productId);
        if (item) {
          queueToast('success', `${item.displayName || item.title} removed from cart`);
        }
        
        const updatedCart = prevCart.filter(item => (item.variantId || item.Id) !== productId);
        
        // Deferred localStorage write
        requestAnimationFrame(() => {
          try {
            localStorage.setItem('freshmart-cart', JSON.stringify(updatedCart));
          } catch (error) {
            console.error('Error saving cart:', error);
          }
          setLoading(false);
          resolve();
        });
        
        return updatedCart;
      });
    });
  }, [queueToast, loading]);

const updateQuantity = useCallback(async (productId, newQuantity) => {
    if (loading) return Promise.resolve();
    
    if (newQuantity <= 0) {
      return removeFromCart(productId);
    }

    return new Promise((resolve) => {
      setLoading(true);
      
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
        
        // Deferred localStorage write
        requestAnimationFrame(() => {
          try {
            localStorage.setItem('freshmart-cart', JSON.stringify(updatedCart));
          } catch (error) {
            console.error('Error saving cart:', error);
          }
          setLoading(false);
          resolve();
        });
        
        return updatedCart;
      });
    });
  }, [removeFromCart, queueToast, loading]);
const clearCart = useCallback(async (skipConfirmation = false) => {
    if (loading) return Promise.resolve();
    
    if (!skipConfirmation && cart.length > 0) {
      const confirmed = window.confirm('Are you sure you want to clear your cart? This action cannot be undone.');
      if (!confirmed) return Promise.resolve();
    }

    return new Promise((resolve) => {
      setLoading(true);
      
      setCart([]);
      
      // Deferred localStorage cleanup
      requestAnimationFrame(() => {
        try {
          localStorage.removeItem('freshmart-cart');
          queueToast('success', "Cart cleared");
        } catch (error) {
          console.error('Error clearing cart:', error);
        }
        setLoading(false);
        resolve();
      });
    });
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

const validateCart = useCallback(async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty. Add some items to proceed.");
      return false;
    }
    
    try {
      // Import products data for comprehensive stock validation
      const products = (await import('@/services/mockData/products.json')).default;
      
      for (const item of cart) {
        // Check if product exists in database
        const product = products.find(p => p.Id === item.Id);
        if (!product) {
          toast.error(`Product "${item.title}" is no longer available.`);
          return false;
        }
        
        // Check if product is active
        if (!product.isActive) {
          toast.error(`Product "${item.title}" is currently unavailable.`);
          return false;
        }
        
        // Check stock availability
        if (product.stock < item.quantity) {
          toast.error(`Only ${product.stock} units of "${item.title}" are available.`);
          return false;
        }
        
        // Check for valid quantity
        if (item.quantity <= 0) {
          toast.error(`Invalid quantity for "${item.title}".`);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Cart validation error:', error);
      toast.error("Failed to validate cart. Please try again.");
      return false;
    }
  }, [cart]);

const hasStock = useCallback(async (productId, requestedQuantity = 1) => {
    try {
      // Import products data for real stock checking
      const products = (await import('@/services/mockData/products.json')).default;
      const product = products.find(p => p.Id === productId);
      
      if (!product) return false;
      if (!product.isActive) return false;
      
      return product.stock >= requestedQuantity && requestedQuantity > 0;
    } catch (error) {
      console.error('Stock validation error:', error);
      return false;
    }
  }, []);

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
    validateCart,
    hasStock,
    isInitialized,
    loading
  };
};