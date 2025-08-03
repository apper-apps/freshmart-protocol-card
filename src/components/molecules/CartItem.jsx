import React from "react";
import { useCart } from "@/hooks/useCart";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

const handleQuantityChange = (newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(item.variantId || item.Id);
    } else {
      updateQuantity(item.variantId || item.Id, newQuantity);
    }
  };

  const handleRemoveItem = () => {
    removeFromCart(item.variantId || item.Id);
  };

  return (
    <Card className="p-4">
    <div className="flex gap-4">
        <div
            className="w-20 h-20 rounded-lg overflow-hidden bg-surface-100 flex-shrink-0">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1 truncate">
                {item.displayName || item.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
                <p className="text-sm text-gray-600">
                    {item.category}
                </p>
                {item.selectedVariant && <span
                    className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                    {item.selectedVariant.size || item.selectedVariant.weight || item.selectedVariant.color || item.selectedVariant.name}
                </span>}
            </div>
            <div className="flex items-center justify-between">
                <span className="text-lg font-bold gradient-text">RS {(item.price * item.quantity).toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.quantity - 1)}
                            className={`w-8 h-8 p-0 transition-all duration-200 ${item.quantity <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-red-50 hover:border-red-300 hover:text-red-600"}`}
                            disabled={item.quantity <= 1}>
                            <ApperIcon name="Minus" size={14} />
                        </Button>
                        <span className="w-10 text-center font-medium bg-surface-50 rounded px-2 py-1">
                            {item.quantity}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.quantity + 1)}
                            className={`w-8 h-8 p-0 transition-all duration-200 ${item.quantity >= (item.stock || 99) ? "opacity-50 cursor-not-allowed" : "hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600"}`}
                            disabled={item.quantity >= (item.stock || 99)}>
                            <ApperIcon name="Plus" size={14} />
                        </Button>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveItem}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2">
                    <ApperIcon name="Trash2" size={16} />
                </Button>
            </div>
        </div></div></Card>
  );
};

export default CartItem;