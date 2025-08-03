import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "@/hooks/useCart";
import orderService from "@/services/api/orderService";
import ApperIcon from "@/components/ApperIcon";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const Checkout = () => {
  const navigate = useNavigate();
const { cart, getSubtotal, clearCart, validateCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Confirmation
  const [redirecting, setRedirecting] = useState(false);
  
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

  // Handle cart validation and navigation after render
useEffect(() => {
    // Redirection guard - prevent infinite loops
    if (window.location.pathname.includes('redirecting')) {
      window.location.href = '/cart';
      return;
    }

    if (!cart || cart.length === 0) {
      setRedirecting(true);
      toast.error("Your cart is empty. Please add items before checkout.");
      // Use setTimeout to ensure navigation happens after render
      const timer = setTimeout(() => {
        navigate("/cart", { replace: true });
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // Validate cart when component loads with stock checking
      if (!validateCartWithStock()) {
        setRedirecting(true);
        const timer = setTimeout(() => {
          navigate("/cart", { replace: true });
        }, 1500); // Give user time to see validation errors
        
        return () => clearTimeout(timer);
      }
    }
  }, [cart, navigate]);

// Enhanced cart validation with stock checking - equivalent to backend validation
  const validateCartWithStock = async () => {
    if (!cart || cart.length === 0) {
      toast.error("Your cart is empty. Please add items before checkout.");
      return false;
    }
    
    try {
      // Use orderService validation (equivalent to backend route handler)
      await orderService.validateCart(cart);
      return true;
    } catch (error) {
      console.error('Cart validation failed:', error);
      
      // Handle specific validation errors
      if (error.message.includes('no longer available')) {
        toast.error(error.message);
      } else if (error.message.includes('currently unavailable')) {
        toast.error(error.message);
      } else if (error.message.includes('units of')) {
        toast.error(error.message);
      } else if (error.message.includes('Price mismatch')) {
        toast.error(error.message);
      } else if (error.message.includes('Invalid quantity')) {
        toast.error(error.message);
      } else {
        toast.error("Cart validation failed. Please review your items and try again.");
      }
      
      return false;
    }
  };

  const subtotal = getSubtotal();
  const deliveryFee = subtotal >= 1500 ? 0 : 150;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax;

const paymentMethods = [
    { 
      id: "jazzcash", 
      name: "JazzCash", 
      account: "03001234567", 
      icon: "Smartphone",
      gateway: "jazzcash",
      type: "mobile_wallet"
    },
    { 
      id: "easypaisa", 
      name: "EasyPaisa", 
      account: "03009876543", 
      icon: "Smartphone",
      gateway: "easypaisa", 
      type: "mobile_wallet"
    },
    { 
      id: "bank", 
      name: "Bank Transfer", 
      account: "1234567890 (HBL)", 
      icon: "Building",
      gateway: "bank_transfer",
      type: "bank"
    },
    { 
      id: "card", 
      name: "Credit/Debit Card", 
      account: "Visa/Mastercard", 
      icon: "CreditCard",
      gateway: "stripe",
      type: "card"
    }
  ];

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!address.fullName || !address.phone || !address.address || !address.city) {
      toast.error("Please fill all required fields");
      return;
    }
    setStep(2);
  };

const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!payment.method) {
      toast.error("Please select a payment method");
      return;
    }

    try {
      setLoading(true);
      toast.info("Initializing payment gateway...");

      // Initialize Apper SDK for payment processing
      if (typeof window.Apper !== 'undefined') {
        const selectedPaymentMethod = paymentMethods.find(m => m.id === payment.method);
        
        const paymentConfig = {
          gateway: selectedPaymentMethod.gateway,
          amount: total,
          currency: 'PKR',
          orderId: `ORDER_${Date.now()}`,
          customerInfo: {
            name: address.fullName,
            email: address.email || 'customer@freshmart.com',
            phone: address.phone
          },
          metadata: {
            items: cart.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price
            }))
          }
        };

        const paymentResult = await window.Apper.processPayment(paymentConfig);
        
        if (paymentResult.success) {
          setPayment(prev => ({
            ...prev,
            transactionId: paymentResult.transactionId,
            paymentProof: paymentResult.receiptUrl,
            status: 'completed'
          }));
          toast.success("Payment processed successfully!");
          setStep(3);
        } else {
          throw new Error(paymentResult.error || 'Payment processing failed');
        }
      } else {
        // Fallback for manual entry if SDK not available
        if (!payment.transactionId) {
          toast.error("Please enter transaction ID");
          return;
        }
        setStep(3);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(error.message || "Payment processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      toast.info("Processing your order...");
      
      // Check network connectivity
      if (!navigator.onLine) {
        toast.error("No internet connection. Please check your network and try again later.");
        return;
      }

      // Final cart validation before order placement
      const isValid = await validateCartWithStock();
      if (!isValid) {
        setRedirecting(true);
        setTimeout(() => navigate("/cart", { replace: true }), 1000);
        return;
      }

      // Verify payment status if using Apper SDK
      let finalPaymentStatus = payment.status;
      if (typeof window.Apper !== 'undefined' && payment.transactionId) {
        try {
          const paymentVerification = await window.Apper.verifyPayment(payment.transactionId);
          if (!paymentVerification.success || paymentVerification.status !== 'completed') {
            throw new Error('Payment verification failed. Please contact support.');
          }
          finalPaymentStatus = paymentVerification.status;
          toast.success("Payment verified successfully!");
        } catch (verifyError) {
          console.error('Payment verification error:', verifyError);
          toast.error("Payment verification failed. Please contact support.");
          return;
        }
      }

      const orderData = {
        items: cart,
        deliveryAddress: address,
        paymentMethod: payment.method,
        transactionId: payment.transactionId,
        paymentProof: payment.paymentProof || payment.screenshot,
        paymentStatus: finalPaymentStatus,
        paymentGateway: paymentMethods.find(m => m.id === payment.method)?.gateway,
        subtotal,
        deliveryFee,
        tax,
        total,
        orderSource: 'web_app',
        processingTimestamp: new Date().toISOString()
      };

      // Set timeout for order creation (10 seconds max for payment processing)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });

      const order = await Promise.race([
        orderService.create(orderData),
        timeoutPromise
      ]);
      
      // Send confirmation to Apper SDK if available
      if (typeof window.Apper !== 'undefined' && order.Id) {
        try {
          await window.Apper.confirmOrder({
            orderId: order.Id,
            transactionId: payment.transactionId,
            amount: total,
            status: 'confirmed'
          });
        } catch (confirmError) {
          console.warn('Order confirmation to Apper failed:', confirmError);
          // Don't fail the order placement for confirmation errors
        }
      }
      
      clearCart();
      toast.success("Order placed successfully! Confirmation sent to your email.");
      navigate(`/orders/${order.Id}`);
    } catch (error) {
      console.error('Order placement failed:', error);
      
      if (error.message === 'Request timeout') {
        toast.error("Request timed out. Please try again later.");
      } else if (error.message.includes('Payment verification failed')) {
        toast.error("Payment verification failed. Please contact support with your transaction ID.");
      } else if (error.message.includes('stock')) {
        toast.error("Some items went out of stock. Please review your cart.");
        setRedirecting(true);
        setTimeout(() => navigate("/cart", { replace: true }), 1000);
      } else if (!navigator.onLine) {
        toast.error("Connection lost. Please try again when online.");
      } else {
        toast.error("Failed to place order. Please try again or contact support.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Account number copied!");
  };

  // Show loading state while redirecting for empty cart with timeout
  if (redirecting || !cart || cart.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm mb-2">
            {!cart || cart.length === 0 
              ? "Cart is empty. Redirecting..." 
              : "Validating cart items..."}
          </p>
          <p className="text-gray-400 text-xs">
            This should only take a moment
          </p>
        </div>
      </div>
    );
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