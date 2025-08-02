import React from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { useCart } from "@/hooks/useCart";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(item.Id);
    } else {
      updateQuantity(item.Id, newQuantity);
    }
  };

  return (
    <Card className="p-4">
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
            {item.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {item.category}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold gradient-text">
              RS {(item.price * item.quantity).toLocaleString()}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className="w-8 h-8 p-0"
              >
                <ApperIcon name="Minus" size={14} />
              </Button>
              <span className="w-8 text-center font-medium">
                {item.quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className="w-8 h-8 p-0"
              >
                <ApperIcon name="Plus" size={14} />
              </Button>
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeFromCart(item.Id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
        >
          <ApperIcon name="Trash2" size={16} />
        </Button>
      </div>
    </Card>
  );
};

export default CartItem;