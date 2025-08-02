import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { useCart } from "@/hooks/useCart";
import { orderService } from "@/services/api/orderService";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getSubtotal, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Confirmation
  
  // Address form
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    area: "",
    landmarks: ""
  });

  // Payment form
  const [payment, setPayment] = useState({
    method: "jazzcash",
    transactionId: "",
    screenshot: null
  });

  const subtotal = getSubtotal();
  const deliveryFee = subtotal >= 1500 ? 0 : 150;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax;

  const paymentMethods = [
    { id: "jazzcash", name: "JazzCash", account: "03001234567", icon: "Smartphone" },
    { id: "easypaisa", name: "EasyPaisa", account: "03009876543", icon: "Smartphone" },
    { id: "bank", name: "Bank Transfer", account: "1234567890 (HBL)", icon: "Building" },
    { id: "card", name: "Credit/Debit Card", account: "4532-****-****-1234", icon: "CreditCard" }
  ];

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!address.fullName || !address.phone || !address.address || !address.city) {
      toast.error("Please fill all required fields");
      return;
    }
    setStep(2);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!payment.transactionId) {
      toast.error("Please enter transaction ID");
      return;
    }
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      
      const orderData = {
        items: cart,
        deliveryAddress: address,
        paymentMethod: payment.method,
        transactionId: payment.transactionId,
        paymentProof: payment.screenshot,
        subtotal,
        deliveryFee,
        tax,
        total
      };

      const order = await orderService.create(orderData);
      
      clearCart();
      toast.success("Order placed successfully!");
      navigate(`/orders/${order.Id}`);
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Account number copied!");
  };

  if (cart.length === 0) {
    navigate("/cart");
    return null;
  }

  const selectedPaymentMethod = paymentMethods.find(m => m.id === payment.method);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                step >= stepNum
                  ? "bg-gradient-to-r from-primary-600 to-primary-500"
                  : "bg-surface-300"
              }`}
            >
              {step > stepNum ? (
                <ApperIcon name="Check" size={20} />
              ) : (
                stepNum
              )}
            </div>
            {stepNum < 3 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  step > stepNum ? "bg-primary-500" : "bg-surface-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Delivery Address */}
          {step === 1 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Delivery Address
              </h2>
              
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    value={address.fullName}
                    onChange={(e) => setAddress({...address, fullName: e.target.value})}
                    required
                  />
                  <Input
                    label="Phone Number *"
                    type="tel"
                    value={address.phone}
                    onChange={(e) => setAddress({...address, phone: e.target.value})}
                    required
                  />
                </div>
                
                <Input
                  label="Complete Address *"
                  value={address.address}
                  onChange={(e) => setAddress({...address, address: e.target.value})}
                  required
                />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="City *"
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                    required
                  />
                  <Input
                    label="Area/Locality"
                    value={address.area}
                    onChange={(e) => setAddress({...address, area: e.target.value})}
                  />
                </div>
                
                <Input
                  label="Nearby Landmarks"
                  value={address.landmarks}
                  onChange={(e) => setAddress({...address, landmarks: e.target.value})}
                  placeholder="e.g., Near ABC Mall, Behind XYZ Hospital"
                />
                
                <Button type="submit" className="w-full">
                  Continue to Payment
                  <ApperIcon name="ArrowRight" size={20} className="ml-2" />
                </Button>
              </form>
            </Card>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Payment Method
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                >
                  <ApperIcon name="ChevronLeft" size={16} className="mr-1" />
                  Back
                </Button>
              </div>

              {/* Payment Method Selection */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      payment.method === method.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-surface-200 bg-white hover:border-primary-300"
                    }`}
                    onClick={() => setPayment({...payment, method: method.id})}
                  >
                    <div className="flex items-center gap-3">
                      <ApperIcon name={method.icon} size={24} className="text-primary-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {method.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {method.account}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Instructions */}
              <div className="bg-accent-50 border border-accent-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Payment Instructions
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span>Copy account number: <strong>{selectedPaymentMethod?.account}</strong></span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedPaymentMethod?.account)}
                      className="p-1"
                    >
                      <ApperIcon name="Copy" size={14} />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span>Send amount: <strong>RS {total.toLocaleString()}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span>Enter transaction ID and upload screenshot</span>
                  </div>
                </div>
              </div>

              {/* Transaction Details Form */}
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <Input
                  label="Transaction ID *"
                  value={payment.transactionId}
                  onChange={(e) => setPayment({...payment, transactionId: e.target.value})}
                  placeholder="Enter your transaction ID"
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Screenshot
                  </label>
                  <div className="border-2 border-dashed border-surface-300 rounded-lg p-6 text-center">
                    <ApperIcon name="Upload" size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click to upload payment screenshot
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPayment({...payment, screenshot: e.target.files[0]})}
                      className="hidden"
                      id="screenshot"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("screenshot").click()}
                    >
                      Choose File
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  Continue to Review
                  <ApperIcon name="ArrowRight" size={20} className="ml-2" />
                </Button>
              </form>
            </Card>
          )}

          {/* Step 3: Order Confirmation */}
          {step === 3 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Review Order
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(2)}
                >
                  <ApperIcon name="ChevronLeft" size={16} className="mr-1" />
                  Back
                </Button>
              </div>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-gray-900">Order Items</h3>
                {cart.map((item) => (
                  <div key={item.Id} className="flex items-center gap-4 p-3 bg-surface-50 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold">
                      RS {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery Address */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
                <div className="p-3 bg-surface-50 rounded-lg">
                  <p className="font-medium">{address.fullName}</p>
                  <p className="text-sm text-gray-600">{address.phone}</p>
                  <p className="text-sm text-gray-600">{address.address}</p>
                  <p className="text-sm text-gray-600">{address.city} {address.area}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
                <div className="p-3 bg-surface-50 rounded-lg">
                  <p className="font-medium">{selectedPaymentMethod?.name}</p>
                  <p className="text-sm text-gray-600">Transaction ID: {payment.transactionId}</p>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <ApperIcon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <ApperIcon name="CheckCircle" size={20} className="mr-2" />
                    Place Order
                  </>
                )}
              </Button>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
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

            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center gap-2">
                <ApperIcon name="Shield" size={16} className="text-green-600" />
                <span>Secure payment</span>
              </div>
              <div className="flex items-center gap-2">
                <ApperIcon name="Truck" size={16} className="text-primary-600" />
                <span>Same day delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ApperIcon name="RefreshCw" size={16} className="text-primary-600" />
                <span>Easy returns</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;