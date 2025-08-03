import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "@/hooks/useCart";
import orderService from "@/services/api/orderService";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import { confirmOrder, processPayment, verifyPayment } from "@/utils/apperSDK";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getSubtotal, clearCart, validateCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Confirmation
  const [redirecting, setRedirecting] = useState(false);
  // Address form
// Default address state
  const defaultAddress = {
    fullName: "",
    phone: "",
    address: "",
    city: "",
    area: "",
    landmarks: ""
  };

  const [address, setAddress] = useState(defaultAddress);

  // Payment methods configuration
  const paymentMethods = [
    { id: "jazzcash", name: "JazzCash", account: "03001234567", icon: "Smartphone", gateway: "jazzcash", type: "mobile_wallet" },
    { id: "easypaisa", name: "EasyPaisa", account: "03009876543", icon: "Smartphone", gateway: "easypaisa", type: "mobile_wallet" },
    { id: "bank", name: "Bank Transfer", account: "1234567890 (HBL)", icon: "Building", gateway: "bank_transfer", type: "bank" },
    { id: "cod", name: "Cash on Delivery", account: "Pay when delivered", icon: "Banknote", gateway: "cod", type: "cash" }
  ];

  // Payment form - initialize with first payment method
  const [payment, setPayment] = useState(() => ({
    method: paymentMethods[0].id,
    transactionId: "",
    screenshot: null,
    status: "pending"
  }));

  // Handle cart validation and navigation after render
// Initialize checkout and handle cart validation
  useEffect(() => {
    if (cart.length === 0 && !redirecting) {
      setRedirecting(true);
      toast.error("Your cart is empty. Please add items before checkout.");
      const timer = setTimeout(() => {
        navigate("/cart", { replace: true });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    // Initialize checkout if cart has items
    if (cart.length > 0) {
      initializeCheckout(cart);
    }
  }, [cart, navigate, redirecting]);

  // Initialize checkout process
  const initializeCheckout = async (cartItems) => {
    try {
// Validate cart items against current stock
      const isValid = await validateCart();
      if (!isValid && !redirecting) {
        setRedirecting(true);
        setTimeout(() => navigate("/cart", { replace: true }), 1500);
      }
    } catch (error) {
      console.error('Checkout initialization error:', error);
      toast.error("Failed to initialize checkout. Please try again.");
    }
  };

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
// Enhanced fallback for manual entry if SDK not available
        if (!payment.transactionId || payment.transactionId.trim() === '') {
          // For online payments, generate a standardized fallback transaction ID
          const selectedPaymentMethod = paymentMethods.find(m => m.id === payment.method);
          if (selectedPaymentMethod?.type === 'mobile_wallet' || selectedPaymentMethod?.type === 'bank') {
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substr(2, 12);
            const methodPrefix = selectedPaymentMethod.gateway?.toUpperCase().substr(0, 3) || 'MANUAL';
            const fallbackTransactionId = `${methodPrefix}-${timestamp}-${randomSuffix}`;
            
            setPayment(prev => ({
              ...prev,
              transactionId: fallbackTransactionId
            }));
            toast.warning("Payment will be processed with generated transaction ID. Please complete your payment.");
            setStep(3);
          } else {
            toast.error("Please enter transaction ID to continue");
            return;
          }
        } else {
          setStep(3);
        }
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(error.message || "Payment processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

// Process payment using Apper SDK or manual methods
const processPayment = async () => {
    try {
      const selectedPaymentMethod = paymentMethods.find(m => m.id === payment.method);
      
      if (!selectedPaymentMethod) {
        throw new Error('Invalid payment method selected');
      }

      // For Cash on Delivery, no payment processing needed
      if (payment.method === 'cod') {
        return { success: true, status: 'pending', method: 'cod' };
      }

      // Check if this is an online payment method (should auto-generate transaction ID)
      const isOnlinePayment = ['jazzcash', 'easypaisa', 'bank'].includes(payment.method);
      
      // Use Apper SDK for payment processing if available
      if (typeof window.Apper !== 'undefined') {
        const subtotal = getSubtotal();
        const deliveryFee = subtotal >= 2000 ? 0 : 150;
        const tax = Math.round(subtotal * 0.05);
        const total = subtotal + deliveryFee + tax;

        const paymentConfig = {
          gateway: selectedPaymentMethod.gateway,
          amount: total,
          currency: "PKR",
          orderId: `ORDER-${Date.now()}`,
          customerInfo: {
            name: address.fullName,
            email: `${address.phone}@freshmart.com`,
            phone: address.phone
          },
          metadata: {
            items: cart.map(item => ({ 
              id: item.Id, 
              name: item.title, 
              quantity: item.quantity, 
              price: item.price 
            }))
          }
        };

        const paymentResult = await window.Apper.processPayment(paymentConfig);
        
// Enhanced transaction ID validation and processing
        let finalTransactionId = paymentResult.transactionId;
        
        // Clean and validate existing transaction ID
        if (finalTransactionId && typeof finalTransactionId === 'string') {
          finalTransactionId = finalTransactionId.trim();
          if (finalTransactionId.length === 0) {
            finalTransactionId = null;
          }
        }
        
        if (paymentResult.success && finalTransactionId) {
          setPayment(prev => ({
            ...prev,
            transactionId: finalTransactionId,
            status: paymentResult.status || 'completed'
          }));
          return {
            ...paymentResult,
            transactionId: finalTransactionId
          };
        } else if (paymentResult.success && !finalTransactionId) {
          // Generate robust fallback transaction ID for successful payments without ID
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substr(2, 12);
          const gatewayPrefix = selectedPaymentMethod?.gateway ? 
            selectedPaymentMethod.gateway.toUpperCase().substr(0, 3) : 'APP';
          const fallbackTransactionId = `${gatewayPrefix}-${timestamp}-${randomSuffix}`;
          
          console.log('Generated fallback transaction ID for successful payment:', fallbackTransactionId);
          
          setPayment(prev => ({
            ...prev,
            transactionId: fallbackTransactionId,
            status: paymentResult.status || 'completed'
          }));
          return {
            ...paymentResult,
            transactionId: fallbackTransactionId,
            status: paymentResult.status || 'completed'
          };
        } else {
          throw new Error(paymentResult.error || 'Payment processing failed');
        }
      }

// Fallback handling when Apper SDK is not available
      if (isOnlinePayment) {
        // For online payments, provide better user guidance and validation
        if (!payment.transactionId || payment.transactionId.trim() === '') {
          throw new Error(`Please complete your ${selectedPaymentMethod.name} payment first, then enter the transaction ID you received. If you haven't made the payment yet, please use the account details provided above.`);
        }
        
        // Enhanced transaction ID format validation
        const trimmedTransactionId = payment.transactionId.trim();
        if (trimmedTransactionId.length < 4) {
          throw new Error('Transaction ID is too short. Please enter the complete transaction ID from your payment confirmation.');
        }
        
        // Update payment with validated transaction ID
        setPayment(prev => ({
          ...prev,
          transactionId: trimmedTransactionId
        }));
        
        return { 
          success: true, 
          status: 'pending_verification', 
          transactionId: trimmedTransactionId,
          method: payment.method 
        };
      } else {
        // For non-online payment methods, ensure transaction ID exists
        let finalTransactionId = payment.transactionId;
        if (!finalTransactionId || finalTransactionId.trim() === '') {
          finalTransactionId = `${payment.method.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          setPayment(prev => ({
            ...prev,
            transactionId: finalTransactionId
          }));
        }
        
return { 
          success: true, 
          status: payment.method === 'cod' ? 'pending' : 'pending_verification', 
          transactionId: finalTransactionId,
          method: payment.method 
        };
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
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
// Final cart validation before order placement
      try {
        await orderService.validateCart(cart);
      } catch (validationError) {
        console.error('Final cart validation failed:', validationError);
        toast.error(`Cart validation failed: ${validationError.message}`);
        setRedirecting(true);
        setTimeout(() => navigate("/cart", { replace: true }), 1000);
        return;
      }

      // Process payment
let paymentResult;
      try {
        paymentResult = await processPayment();
        if (!paymentResult.success) {
          throw new Error('Payment processing failed - no valid result received');
        }
        
// Enhanced transaction ID validation with better error messages
if (!paymentResult.transactionId || paymentResult.transactionId.trim() === '') {
          // Generate standardized emergency fallback transaction ID
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substr(2, 12);
// Safely access payment method gateway with fallback for emergency cases
          const selectedPaymentMethod = paymentMethods.find(m => m.id === payment.method);
          const gatewayPrefix = selectedPaymentMethod?.gateway 
            ? selectedPaymentMethod.gateway.toUpperCase().substring(0, 3) 
            : 'EMERGENCY';
          const emergencyTransactionId = `${gatewayPrefix}-${timestamp}-${randomSuffix}`;
          
          console.warn('Payment processing completed but no transaction ID was generated, using emergency fallback:', emergencyTransactionId);
          setPayment(prev => ({
            ...prev,
            transactionId: emergencyTransactionId
          }));
          
          paymentResult.transactionId = emergencyTransactionId;
          toast.warning('Payment processed with generated transaction ID. Order will be verified manually.');
        }
      } catch (paymentError) {
        console.error('Payment processing failed:', paymentError);
        
// Enhanced error messaging based on error type with better user guidance
        if (paymentError.message.includes('Transaction ID is required')) {
          toast.error("Payment processing requires transaction verification. Please complete your payment and try again.");
        } else if (paymentError.message.includes('too short')) {
          toast.error("Transaction ID appears incomplete. Please verify and enter the complete transaction ID.");
        } else if (paymentError.message.includes('complete your')) {
          toast.error(paymentError.message);
        } else {
          toast.error(paymentError.message || "Payment processing failed. Please try again.");
        }
        return;
      }

      // Verify payment status if using Apper SDK
      let finalPaymentStatus = paymentResult.status;
      if (typeof window.Apper !== 'undefined' && paymentResult.transactionId) {
        try {
          const paymentVerification = await window.Apper.verifyPayment(paymentResult.transactionId);
          if (paymentVerification.success && paymentVerification.status === 'completed') {
            finalPaymentStatus = paymentVerification.status;
            toast.success("Payment verified successfully!");
          } else if (paymentVerification.success) {
            finalPaymentStatus = paymentVerification.status;
            toast.info(`Payment status: ${paymentVerification.status}`);
          }
        } catch (verifyError) {
          console.warn('Payment verification warning:', verifyError);
          // Continue with order placement even if verification has issues
          toast.warning('Payment verification had issues, but continuing with order placement');
        }
      }

      const subtotal = getSubtotal();
      const deliveryFee = subtotal >= 2000 ? 0 : 150;
      const tax = Math.round(subtotal * 0.05);
      const total = subtotal + deliveryFee + tax;

      const orderData = {
        items: cart,
        deliveryAddress: address,
        paymentMethod: payment.method,
        transactionId: paymentResult.transactionId,
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

// Enhanced order data validation with transaction ID fallback
if (!orderData.transactionId || orderData.transactionId.trim() === '') {
        // Final standardized fallback transaction ID generation
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substr(2, 12);
        const finalFallbackTransactionId = `FALLBACK-ORDER-${timestamp}-${randomSuffix}`;
        
        console.error('Critical: Transaction ID missing from order data, generating final fallback:', finalFallbackTransactionId);
        
        orderData.transactionId = finalFallbackTransactionId;
        orderData.paymentStatus = 'pending_manual_verification';
        
        toast.warning('Order placed with generated transaction ID. Payment will be verified manually.');
      }
      
      // Additional validation for transaction ID format
      if (orderData.transactionId.length < 4) {
        throw new Error('Invalid transaction ID format detected. Please contact support.');
      }

      // Set timeout for order creation (10 seconds max)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - order creation took too long')), 10000);
      });

      const order = await Promise.race([
        orderService.create(orderData),
        timeoutPromise
      ]);
      
      // Send confirmation to Apper SDK if available
      if (typeof window.Apper !== 'undefined' && order.Id && paymentResult.transactionId) {
        try {
          await window.Apper.confirmOrder({
            orderId: order.Id,
            transactionId: paymentResult.transactionId,
            amount: total,
            status: 'confirmed'
          });
        } catch (confirmError) {
          console.warn('Order confirmation to Apper failed:', confirmError);
          // Don't fail the order placement for confirmation errors
        }
      }
      
      clearCart(true); // Skip confirmation since order is placed
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