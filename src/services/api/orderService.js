import orderData from "@/services/mockData/orders.json";

// Simulate network delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Cart validation function - equivalent to backend validation
const validateCart = async (cartItems) => {
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error('Cart is empty or invalid');
  }

  try {
    // Import products data for stock validation
    const products = (await import('@/services/mockData/products.json')).default;
    
    for (const item of cartItems) {
      // Check if product exists
      const product = products.find(p => p.Id === item.Id);
      if (!product) {
        throw new Error(`Product "${item.title || 'Unknown'}" is no longer available`);
      }
      
      // Check if product is active
      if (!product.isActive) {
        throw new Error(`Product "${product.title}" is currently unavailable`);
      }
      
      // Check stock availability
      if (product.stock < item.quantity) {
        throw new Error(`Only ${product.stock} units of "${product.title}" are available`);
      }
      
      // Validate quantity is positive
      if (item.quantity <= 0) {
        throw new Error(`Invalid quantity for "${product.title}"`);
      }
      
      // Check for price consistency (optional - prevents price manipulation)
      if (item.price && Math.abs(item.price - product.price) > 0.01) {
        throw new Error(`Price mismatch for "${product.title}". Please refresh your cart.`);
      }
    }
    
    return true;
  } catch (error) {
    throw error;
  }
};
// Order management with enhanced features

let nextId = Math.max(...orderData.map(order => order.Id), 0) + 1;
let orders = [...orderData];

const orderService = {
  // Validate cart before checkout - equivalent to backend route handler
  validateCart: async (cartItems) => {
    await delay(200);
    return validateCart(cartItems);
  },

  // Get all orders
  getAll: async () => {
    await delay(300);
    return orders.map(order => ({ ...order }));
  },

  // Get order by ID
  getById: async (id) => {
    await delay(200);
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      throw new Error('Invalid order ID');
    }
    const order = orders.find(o => o.Id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    return { ...order };
  },

  // Create new order with cart validation
create: async (orderData) => {
    await delay(500);
    
    if (!orderData || typeof orderData !== 'object') {
      throw new Error('Invalid order data');
    }

    // Validate cart before creating order
    try {
      await validateCart(orderData.items);
    } catch (error) {
      throw new Error(`Cart validation failed: ${error.message}`);
    }

    // Validate payment information
    if (!orderData.paymentMethod) {
      throw new Error('Payment method is required');
    }

    if (!orderData.transactionId && orderData.paymentMethod !== 'cod') {
      throw new Error('Transaction ID is required for online payments');
    }

    // Determine initial order status based on payment
    let initialStatus = 'pending';
    if (orderData.paymentStatus === 'completed') {
      initialStatus = 'confirmed';
    } else if (orderData.paymentMethod === 'cod') {
      initialStatus = 'pending';
    } else if (orderData.transactionId) {
      initialStatus = 'payment_pending';
    }

    const newOrder = {
      Id: nextId++,
      ...orderData,
      status: initialStatus,
      orderDate: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      trackingNumber: `FM${Date.now()}${Math.floor(Math.random() * 1000)}`,
      paymentHistory: [{
        timestamp: new Date().toISOString(),
        status: orderData.paymentStatus || 'pending',
        transactionId: orderData.transactionId,
        gateway: orderData.paymentGateway,
        amount: orderData.total
      }],
      processingDetails: {
        source: orderData.orderSource || 'web_app',
        processingTime: orderData.processingTimestamp,
        ipAddress: '127.0.0.1', // Mock IP for demo
        userAgent: 'FreshMart Web App'
      }
    };

    orders.push(newOrder);
    return { ...newOrder };
  },

  // Update order status
  updateStatus: async (id, status) => {
    await delay(400);
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      throw new Error('Invalid order ID');
    }
    
    const index = orders.findIndex(o => o.Id === orderId);
    if (index === -1) {
      throw new Error("Order not found");
    }
    
    const updatedOrder = {
      ...orders[index],
      status,
      updatedAt: new Date().toISOString()
    };
    
    orders[index] = updatedOrder;
    return { ...updatedOrder };
  },

  // Delete order
  delete: async (id) => {
    await delay(300);
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      throw new Error('Invalid order ID');
    }
    
    const index = orders.findIndex(o => o.Id === orderId);
    if (index === -1) {
      throw new Error("Order not found");
    }
    
    orders.splice(index, 1);
    return { success: true };
  }
};

export default orderService;