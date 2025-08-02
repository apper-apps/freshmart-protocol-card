import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import ApperIcon from '@/components/ApperIcon';
import { productService } from '@/services/api/productService';
import { orderService } from '@/services/api/orderService';

const POSCheckout = () => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Barcode Scanner Functions
  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScannerActive(true);
        
        // Start scanning interval
        intervalRef.current = setInterval(() => {
          scanBarcode();
        }, 1000);
      }
    } catch (err) {
      toast.error('Camera access denied or not available');
      console.error('Scanner error:', err);
    }
  };

  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setScannerActive(false);
  };

  const scanBarcode = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // For demo purposes, simulate barcode detection
    // In real implementation, use a barcode scanning library like QuaggaJS
    const mockBarcode = generateMockBarcode();
    if (mockBarcode) {
      handleBarcodeDetected(mockBarcode);
    }
  };

  const generateMockBarcode = () => {
    // Simulate finding a barcode every 10 seconds for demo
    if (Math.random() < 0.1) {
      const productIds = products.map(p => p.Id);
      return productIds[Math.floor(Math.random() * productIds.length)]?.toString();
    }
    return null;
  };

  const handleBarcodeDetected = async (detectedBarcode) => {
    try {
      setIsScanning(true);
      const product = await productService.getByBarcode(detectedBarcode);
      addToCart(product);
      stopScanner();
      setBarcode('');
    } catch (err) {
      toast.error('Product not found for barcode: ' + detectedBarcode);
    } finally {
      setIsScanning(false);
    }
  };

  // Manual barcode input
  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    
    try {
      setIsScanning(true);
      const product = await productService.getByBarcode(barcode);
      addToCart(product);
      setBarcode('');
    } catch (err) {
      toast.error('Product not found for barcode: ' + barcode);
    } finally {
      setIsScanning(false);
    }
  };

  // Product search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      loadProducts();
      return;
    }
    
    try {
      const results = await productService.searchProducts(query);
      setProducts(results);
    } catch (err) {
      toast.error('Search failed');
    }
  };

  // Cart management
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.Id === product.Id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          toast.warning(`Only ${product.stock} items available`);
          return prevCart;
        }
        
        toast.success(`Updated ${product.title} quantity`);
        return prevCart.map(item =>
          item.Id === product.Id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        if (quantity > product.stock) {
          toast.warning(`Only ${product.stock} items available`);
          return prevCart;
        }
        
        toast.success(`${product.title} added to cart`);
        return [...prevCart, { ...product, quantity }];
      }
    });
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.Id === productId) {
          if (newQuantity > item.stock) {
            toast.warning(`Only ${item.stock} items available`);
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const item = prevCart.find(item => item.Id === productId);
      if (item) {
        toast.success(`${item.title} removed from cart`);
      }
      return prevCart.filter(item => item.Id !== productId);
    });
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared');
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  // Process sale
  const processSale = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create order
      const orderData = {
        items: cart.map(item => ({
          productId: item.Id,
          quantity: item.quantity,
          price: item.price,
          title: item.title
        })),
        customerName: customerName || 'Walk-in Customer',
        customerPhone,
        subtotal,
        tax,
        total,
        paymentMethod,
        orderType: 'pos',
        status: 'completed'
      };
      
      const order = await orderService.create(orderData);
      
      // Update stock for each item
      for (const item of cart) {
        const newStock = item.stock - item.quantity;
        await productService.updateStock(item.Id, newStock);
      }
      
      toast.success(`Sale completed! Order #${order.Id}`);
      
      // Reset form
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setPaymentMethod('cash');
      
      // Reload products to update stock
      loadProducts();
      
    } catch (err) {
      toast.error('Sale processing failed');
      console.error('Sale error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && products.length === 0) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadProducts} />;
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">POS Checkout</h1>
        <p className="text-gray-600">Scan barcodes or search products to add to cart</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Barcode Scanner Section */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ApperIcon name="Scan" size={20} />
              Barcode Scanner
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={scannerActive ? stopScanner : startScanner}
                  variant={scannerActive ? "secondary" : "primary"}
                  className="flex items-center gap-2"
                >
                  <ApperIcon name={scannerActive ? "Square" : "Camera"} size={16} />
                  {scannerActive ? 'Stop Scanner' : 'Start Scanner'}
                </Button>
              </div>
              
              {scannerActive && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full max-w-md h-48 bg-black rounded-lg"
                    playsInline
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute inset-0 border-2 border-primary-500 rounded-lg pointer-events-none">
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary-500"></div>
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary-500"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary-500"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary-500"></div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                <Input
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Enter barcode manually"
                  className="flex-1"
                />
                <Button type="submit" disabled={isScanning || !barcode.trim()}>
                  {isScanning ? <Loading type="spinner" /> : 'Add'}
                </Button>
              </form>
            </div>
          </Card>

          {/* Product Search */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ApperIcon name="Search" size={20} />
              Search Products
            </h2>
            
            <Input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name, category, or barcode..."
              className="mb-4"
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {products.map(product => (
                <div
                  key={product.Id}
                  className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-20 object-cover rounded mb-2"
                  />
                  <h3 className="font-medium text-sm">{product.title}</h3>
                  <p className="text-primary-600 font-semibold">₹{product.price}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>Stock: {product.stock}</span>
                    <Badge variant={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}>
                      {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Cart & Checkout */}
        <div className="space-y-6">
          {/* Cart */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ApperIcon name="ShoppingCart" size={20} />
                Cart ({cart.length})
              </h2>
              {cart.length > 0 && (
                <Button variant="secondary" size="sm" onClick={clearCart}>
                  Clear
                </Button>
              )}
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Cart is empty</p>
              ) : (
                cart.map(item => (
                  <div key={item.Id} className="flex items-center gap-3 p-2 border rounded">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.title}</h4>
                      <p className="text-primary-600 font-semibold">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateCartQuantity(item.Id, item.quantity - 1)}
                      >
                        <ApperIcon name="Minus" size={12} />
                      </Button>
                      <span className="mx-2 min-w-[2rem] text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateCartQuantity(item.Id, item.quantity + 1)}
                      >
                        <ApperIcon name="Plus" size={12} />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => removeFromCart(item.Id)}
                        className="ml-2 text-red-600"
                      >
                        <ApperIcon name="Trash2" size={12} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Customer Info */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ApperIcon name="User" size={20} />
              Customer Info
            </h2>
            
            <div className="space-y-3">
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name (optional)"
              />
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone number (optional)"
                type="tel"
              />
            </div>
          </Card>

          {/* Payment & Total */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ApperIcon name="CreditCard" size={20} />
              Payment
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="wallet">Digital Wallet</option>
                </select>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tax (10%):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              
              <Button
                onClick={processSale}
                disabled={cart.length === 0 || loading}
                className="w-full"
                size="lg"
              >
                {loading ? <Loading type="spinner" /> : `Process Sale - ₹${total.toFixed(2)}`}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default POSCheckout;