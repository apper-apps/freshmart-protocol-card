import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart, loading } = useCart();
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  // Sync local quantity with prop changes
  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  const handleQuantityChange = async (newQuantity) => {
    if (isLocalLoading || loading) return;
    
    const itemId = item.variantId || item.Id;
    const maxStock = item.stock || 99;
    
    // Boundary checks
    if (newQuantity < 0) return;
    if (newQuantity > maxStock) {
      toast.error(`Only ${maxStock} items available in stock`);
      return;
    }
    
    // Optimistic update
    setLocalQuantity(newQuantity);
    setIsLocalLoading(true);
    
    try {
      if (newQuantity === 0) {
        await handleRemoveItem(true); // Skip confirmation for quantity-based removal
      } else {
        await updateQuantity(itemId, newQuantity);
      }
    } catch (error) {
      // Revert optimistic update on error
      setLocalQuantity(item.quantity);
      toast.error('Failed to update quantity. Please try again.');
    } finally {
      setIsLocalLoading(false);
    }
  };
  
  const handleRemoveItem = async (skipConfirmation = false) => {
    if (isLocalLoading || loading) return;
    
    const itemName = item.displayName || item.title;
    
    if (!skipConfirmation) {
      const confirmed = window.confirm(`Remove ${itemName} from cart?`);
      if (!confirmed) return;
    }
    
    setIsLocalLoading(true);
    
    try {
      const itemId = item.variantId || item.Id;
      await removeFromCart(itemId);
    } catch (error) {
      setIsLocalLoading(false);
      toast.error('Failed to remove item. Please try again.');
    }
  };

  const isDisabled = loading || isLocalLoading;

  return (
    <Card 
      className="p-4 transition-all duration-300"
      data-cart-item={item.variantId || item.Id}
    >
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-100 flex-shrink-0">
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-cover" 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 truncate">
            {item.displayName || item.title}
          </h3>
          
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm text-gray-600">
              {item.category}
            </p>
            {item.selectedVariant && (
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                {item.selectedVariant.size || item.selectedVariant.weight || item.selectedVariant.color || item.selectedVariant.name}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold gradient-text">
              RS {(item.price * localQuantity).toLocaleString()}
            </span>
            
            <div className="flex items-center gap-2">
              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(localQuantity - 1)}
                  className={`quantity-btn w-10 h-10 p-0 transition-all duration-200 touch-target ${
                    localQuantity <= 1 || isDisabled
                      ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200" 
                      : "hover:bg-red-50 hover:border-red-300 hover:text-red-600 hover:scale-105 active:scale-95"
                  }`}
                  disabled={localQuantity <= 1 || isDisabled}
                  aria-label={`Decrease quantity of ${item.displayName || item.title}`}
                >
                  {isDisabled ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                  ) : (
                    <ApperIcon name="Minus" size={16} />
                  )}
                </Button>
                
                <div className="flex flex-col items-center">
                  <span className={`w-12 text-center font-semibold text-lg bg-surface-50 rounded-lg px-3 py-2 transition-all duration-200 ${
                    isLocalLoading ? 'cart-bounce price-change-animation ring-2 ring-primary-200' : ''
                  }`}>
                    {localQuantity}
                  </span>
                  {item.stock && item.stock < 10 && (
                    <span className="text-xs text-orange-600 mt-1 stock-pulse">
                      {item.stock} left
                    </span>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(localQuantity + 1)}
                  className={`quantity-btn w-10 h-10 p-0 transition-all duration-200 touch-target ${
                    localQuantity >= (item.stock || 99) || isDisabled
                      ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200" 
                      : "hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600 hover:scale-105 active:scale-95"
                  }`}
                  disabled={localQuantity >= (item.stock || 99) || isDisabled}
                  aria-label={`Increase quantity of ${item.displayName || item.title}`}
                >
                  {isDisabled ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin"></div>
                  ) : (
                    <ApperIcon name="Plus" size={16} />
                  )}
                </Button>
              </div>
              
              {/* Delete Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveItem(false)}
                disabled={isDisabled}
                className={`delete-btn text-red-600 hover:text-red-700 hover:bg-red-50 p-3 transition-all duration-200 touch-target hover:scale-105 active:scale-95 ${
                  isDisabled ? "opacity-40 cursor-not-allowed" : ""
                }`}
                aria-label={`Remove ${item.displayName || item.title} from cart`}
              >
                {isDisabled ? (
                  <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                ) : (
                  <ApperIcon name="Trash2" size={18} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CartItem;