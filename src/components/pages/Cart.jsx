import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import CartItem from "@/components/molecules/CartItem";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { useCart } from "@/hooks/useCart";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, getSubtotal, getTotalItems, clearCart } = useCart();

  const subtotal = getSubtotal();
  const deliveryFee = subtotal >= 1500 ? 0 : 150;
  const tax = Math.round(subtotal * 0.05); // 5% tax
  const total = subtotal + deliveryFee + tax;

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const handleContinueShopping = () => {
    navigate("/categories");
  };

  if (cart.length === 0) {
    return (
      <div className="p-4">
        <Empty
          title="Your cart is empty"
          message="Add some fresh groceries to get started!"
          icon="ShoppingCart"
          actionLabel="Start Shopping"
          onAction={handleContinueShopping}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display text-gray-900">
          Shopping Cart ({getTotalItems()} items)
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <ApperIcon name="Trash2" size={16} className="mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <CartItem key={item.Id} item={item} />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>RS {subtotal.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    `RS ${deliveryFee}`
                  )}
                </span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>Tax (5%)</span>
                <span>RS {tax.toLocaleString()}</span>
              </div>
              
              <div className="border-t border-surface-200 pt-3">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>RS {total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {subtotal >= 1500 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-green-700">
                  <ApperIcon name="Truck" size={16} />
                  <span className="text-sm font-medium">
                    🎉 You qualify for FREE delivery!
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-accent-50 border border-accent-200 rounded-lg p-3 mb-4">
                <div className="text-center text-sm">
                  <p className="text-gray-700 mb-1">
                    Add <span className="font-bold">RS {(1500 - subtotal).toLocaleString()}</span> more for FREE delivery!
                  </p>
                  <div className="w-full bg-surface-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-600 to-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((subtotal / 1500) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={handleCheckout}
              className="w-full mb-3"
              size="lg"
            >
              <ApperIcon name="CreditCard" size={20} className="mr-2" />
              Proceed to Checkout
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleContinueShopping}
              className="w-full"
              size="lg"
            >
              <ApperIcon name="ArrowLeft" size={20} className="mr-2" />
              Continue Shopping
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;