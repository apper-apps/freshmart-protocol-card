import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export const useCart = () => {
const [cart, setCart] = useState([]);
  const [toastQueue, setToastQueue] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
const [loading, setLoading] = useState(false);
  const [operationQueue, setOperationQueue] = useState([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

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
    if (toastQueue.length > 0 && !loading) {
      const currentToast = toastQueue[0];
      try {
        if (currentToast.type === 'success') {
          toast.success(currentToast.message, {
            position: "bottom-center",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
          });
        } else if (currentToast.type === 'warning') {
          toast.warning(currentToast.message, {
            position: "bottom-center",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else if (currentToast.type === 'error') {
          toast.error(currentToast.message, {
            position: "bottom-center",
            autoClose: 4000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      } catch (error) {
        console.error('Toast notification error:', error);
      }
      setToastQueue(prev => prev.slice(1));
    }
  }, [toastQueue, loading]);
const queueToast = useCallback((type, message) => {
    // Defer toast queuing to prevent render-phase state updates
    setTimeout(() => {
      setToastQueue(prev => [...prev, { type, message, timestamp: Date.now() }]);
    }, 0);
  }, []);

  // Safe toast helper that prevents render-phase updates
  const safeToast = useCallback((type, message) => {
    // Use setTimeout to ensure we're not in render phase
    setTimeout(() => {
      try {
        if (type === 'success') {
          toast.success(message, {
            position: "bottom-center",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
          });
        } else if (type === 'warning') {
          toast.warning(message, {
            position: "bottom-center",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else if (type === 'error') {
          toast.error(message, {
            position: "bottom-center",
            autoClose: 4000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      } catch (error) {
        console.error('Toast notification error:', error);
      }
    }, 0);
  }, []);
  // Process operation queue
  useEffect(() => {
    if (operationQueue.length > 0 && !isProcessingQueue && !loading) {
      setIsProcessingQueue(true);
      const operation = operationQueue[0];
      
      const processOperation = async () => {
        try {
          await operation.execute();
          setOperationQueue(prev => prev.slice(1));
        } catch (error) {
          console.error('Operation failed:', error);
          queueToast('error', 'Operation failed. Please try again.');
          setOperationQueue(prev => prev.slice(1));
        } finally {
          setIsProcessingQueue(false);
        }
      };
      
      processOperation();
    }
  }, [operationQueue, isProcessingQueue, loading]);

  const queueOperation = useCallback((operation) => {
    setOperationQueue(prev => [...prev, operation]);
  }, []);
const addToCart = useCallback(async (product, quantity = 1) => {
if (loading || isProcessingQueue) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      setLoading(true);
      
      const itemId = product.variantId || product.Id;
      const variantText = product.selectedVariant 
        ? ` (${product.selectedVariant.size || product.selectedVariant.weight || product.selectedVariant.color || product.selectedVariant.name})`
        : '';

// Validate stock before proceeding
      const maxStock = product.stock || 99;
      if (quantity > maxStock) {
        safeToast('error', `Only ${maxStock} items available in stock`);
        setLoading(false);
        resolve();
        return;
      }
      setCart(prevCart => {
        const existingItem = prevCart.find(item => 
          (item.variantId || item.Id) === itemId
        );
        
        let updatedCart;
        let operation = 'add';
        
        if (existingItem) {
const newQuantity = existingItem.quantity + quantity;
          if (newQuantity > maxStock) {
            safeToast('error', `Only ${maxStock} items available in stock`);
            setLoading(false);
            resolve();
            return prevCart;
          }
          
          operation = 'update';
          safeToast('success', `Updated ${product.title}${variantText} in cart`);
          updatedCart = prevCart.map(item =>
            (item.variantId || item.Id) === itemId
              ? { 
                  ...item, 
                  quantity: newQuantity,
                  price: product.price,
                  lastUpdated: Date.now()
                }
              : item
          );
} else {
          safeToast('success', `${product.title}${variantText} added to cart`);
          updatedCart = [...prevCart, { 
            ...product, 
            quantity,
            variantId: itemId,
            displayName: `${product.title}${variantText}`,
            price: product.price,
            addedAt: Date.now(),
            lastUpdated: Date.now()
          }];
        }
        
        // Batch localStorage operations for performance
        const saveOperation = () => {
          try {
            localStorage.setItem('freshmart-cart', JSON.stringify(updatedCart));
            setLoading(false);
            resolve();
} catch (error) {
            console.error('Error saving cart:', error);
            safeToast('error', 'Failed to save cart. Please try again.');
            setLoading(false);
            reject(error);
          }
        };

        // Use requestIdleCallback for non-critical localStorage operations
        if (window.requestIdleCallback) {
          window.requestIdleCallback(saveOperation, { timeout: 100 });
        } else {
          setTimeout(saveOperation, 50);
        }
        
        return updatedCart;
      });
    });
  }, [loading, isProcessingQueue]);

const removeFromCart = useCallback(async (productId) => {
    if (loading || isProcessingQueue) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      setLoading(true);
      
      setCart(prevCart => {
const itemToRemove = prevCart.find(item => (item.variantId || item.Id) === productId);
        
        if (!itemToRemove) {
          safeToast('error', 'Item not found in cart');
          setLoading(false);
          resolve();
          return prevCart;
        }

        // Optimistic removal with animation delay
        const updatedCart = prevCart.filter(item => (item.variantId || item.Id) !== productId);
        
        safeToast('success', `${itemToRemove.displayName || itemToRemove.title} removed from cart`);
        // Enhanced localStorage operation with error recovery
        const saveOperation = () => {
          try {
            localStorage.setItem('freshmart-cart', JSON.stringify(updatedCart));
            
            // Additional cleanup for removed items
            const cartStats = {
              totalItems: updatedCart.reduce((sum, item) => sum + item.quantity, 0),
              totalValue: updatedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
              lastModified: Date.now()
            };
            
            localStorage.setItem('freshmart-cart-stats', JSON.stringify(cartStats));
            
            setLoading(false);
            resolve();
} catch (error) {
            console.error('Error removing from cart:', error);
            safeToast('error', 'Failed to remove item. Please try again.');
            // Revert cart state on storage error
            setCart(prevCart);
            setLoading(false);
            reject(error);
          }
        };

        // Delay for smooth animation
        setTimeout(saveOperation, 300);
        
        return updatedCart;
      });
    });
  }, [loading, isProcessingQueue]);

const updateQuantity = useCallback(async (productId, newQuantity) => {
    if (loading || isProcessingQueue) {
      return Promise.resolve();
    }
    
    // Validate quantity bounds
    if (newQuantity < 0) {
      return Promise.resolve();
    }
    
    if (newQuantity === 0) {
      return removeFromCart(productId);
    }

    return new Promise((resolve, reject) => {
      setLoading(true);
      
      setCart(prevCart => {
const targetItem = prevCart.find(item => (item.variantId || item.Id) === productId);
        
        if (!targetItem) {
          safeToast('error', 'Item not found in cart');
          setLoading(false);
          resolve();
          return prevCart;
        }

const maxStock = targetItem.stock || 99;
        
        // Stock validation with user feedback
        if (newQuantity > maxStock) {
          safeToast('error', `Only ${maxStock} ${targetItem.displayName || targetItem.title} available in stock`);
          setLoading(false);
          resolve();
          return prevCart;
        }
        const quantityDiff = newQuantity - targetItem.quantity;
        const action = quantityDiff > 0 ? 'increased' : 'decreased';
        safeToast('success', `Quantity ${action} to ${newQuantity}`);
        const updatedCart = prevCart.map(item => {
          const itemId = item.variantId || item.Id;
          if (itemId === productId) {
            return { 
              ...item, 
              quantity: newQuantity,
              lastUpdated: Date.now(),
              quantityHistory: [
                ...(item.quantityHistory || []).slice(-4), // Keep last 4 changes
                { quantity: newQuantity, timestamp: Date.now() }
              ]
            };
          }
          return item;
        });
        
        // Enhanced localStorage operation with analytics
        const saveOperation = () => {
          try {
            localStorage.setItem('freshmart-cart', JSON.stringify(updatedCart));
            
            // Update cart statistics
            const totalItems = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
            const totalValue = updatedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            localStorage.setItem('freshmart-cart-stats', JSON.stringify({
              totalItems,
              totalValue,
              lastModified: Date.now(),
              lastAction: 'quantity_update'
            }));
            
            setLoading(false);
resolve();
          } catch (error) {
            console.error('Error updating quantity:', error);
            safeToast('error', 'Failed to update quantity. Please try again.');
            // Revert to previous state on error
            setCart(prevCart);
            setLoading(false);
            reject(error);
          }
        };

        // Optimized timing for UI responsiveness
        if (window.requestIdleCallback) {
          window.requestIdleCallback(saveOperation, { timeout: 150 });
        } else {
          setTimeout(saveOperation, 100);
        }
        
        return updatedCart;
      });
    });
  }, [removeFromCart, loading, isProcessingQueue]);
const clearCart = useCallback(async (skipConfirmation = false) => {
    if (loading || isProcessingQueue) {
      return Promise.resolve();
    }
    
    if (!skipConfirmation && cart.length > 0) {
      const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      const confirmed = window.confirm(
        `Are you sure you want to clear your cart? This will remove ${itemCount} item${itemCount !== 1 ? 's' : ''} and cannot be undone.`
      );
      if (!confirmed) return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      setLoading(true);
      
      // Store cart backup for potential recovery
      const cartBackup = [...cart];
      const backupTimestamp = Date.now();
      
      setCart([]);
      
      // Enhanced localStorage cleanup with backup
      const clearOperation = () => {
        try {
          // Store backup temporarily (for 5 minutes)
          localStorage.setItem('freshmart-cart-backup', JSON.stringify({
            data: cartBackup,
            timestamp: backupTimestamp,
            expiry: backupTimestamp + 300000 // 5 minutes
          }));
          
          localStorage.removeItem('freshmart-cart');
          localStorage.removeItem('freshmart-cart-stats');
          
const itemCount = cartBackup.reduce((sum, item) => sum + item.quantity, 0);
          safeToast('success', `Cart cleared (${itemCount} items removed)`);
          setLoading(false);
resolve();
        } catch (error) {
          console.error('Error clearing cart:', error);
          safeToast('error', 'Failed to clear cart. Please try again.');
          // Restore cart on error
          setCart(cartBackup);
          setLoading(false);
          reject(error);
        }
      };

      // Batch operation for better performance
      if (window.requestIdleCallback) {
        window.requestIdleCallback(clearOperation, { timeout: 200 });
      } else {
        setTimeout(clearOperation, 100);
      }
    });
  }, [loading, isProcessingQueue, cart]);
// Get total number of items in cart
  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const getSubtotal = useCallback(() => {
    return cart.reduce((total, item) => {
      // Use the stored price which includes variant modifications
      const itemPrice = item.price || 0;
      return total + (itemPrice * item.quantity);
    }, 0);
  }, [cart]);

  const isInCart = useCallback((productId) => {
    return cart.some(item => (item.variantId || item.Id) === productId);
  }, [cart]);

  const getCartItem = useCallback((productId) => {
    return cart.find(item => (item.variantId || item.Id) === productId);
  }, [cart]);

  const validateCart = useCallback(async () => {
if (cart.length === 0) {
      safeToast('error', "Your cart is empty. Add some items to proceed.");
      return false;
    }
    
    try {
      // Import products data for comprehensive stock validation
      const products = (await import('@/services/mockData/products.json')).default;
      
      for (const item of cart) {
// Check if product exists in database
        const product = products.find(p => p.Id === item.Id);
        if (!product) {
          safeToast('error', `Product "${item.title}" is no longer available.`);
          return false;
        }
        
        // Check if product is active
        if (!product.isActive) {
          safeToast('error', `Product "${item.title}" is currently unavailable.`);
          return false;
        }
        
        // Check stock availability
// Check stock availability
        if (product.stock < item.quantity) {
          safeToast('error', `Only ${product.stock} units of "${item.title}" are available.`);
          return false;
        }
        
        // Check for valid quantity
        if (item.quantity <= 0) {
          safeToast('error', `Invalid quantity for "${item.title}".`);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Cart validation error:', error);
      safeToast('error', "Failed to validate cart. Please try again.");
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
    loading,
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
    isProcessingQueue,
    operationQueue: operationQueue.length,
    queueOperation
  };
};