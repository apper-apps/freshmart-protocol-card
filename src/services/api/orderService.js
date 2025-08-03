import orderData from "@/services/mockData/orders.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const orderService = {
  async getAll() {
    await delay(400);
    return [...orderData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getById(id) {
    await delay(300);
    const order = orderData.find(o => o.Id === id);
    if (!order) {
      throw new Error("Order not found");
    }
    return { ...order };
  },

async create(orderData) {
    await delay(500);
    
    // Validate order data
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error("Order must contain at least one item");
    }
    
    if (!orderData.deliveryAddress || !orderData.paymentMethod) {
      throw new Error("Delivery address and payment method are required");
    }
    
    // Import existing orders to calculate new ID
    const existingOrders = (await import('@/services/mockData/orders.json')).default;
    const newId = existingOrders && existingOrders.length > 0 
      ? Math.max(...existingOrders.map(o => o.Id)) + 1 
      : 1;
    
    const newOrder = {
      Id: newId,
      customerId: orderData.customerId || `cust_${Date.now()}`,
      status: orderData.status || "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: orderData.items.map(item => ({
        ...item,
        vendorId: item.vendorId || 1
      })),
      deliveryAddress: orderData.deliveryAddress,
      paymentMethod: orderData.paymentMethod,
      transactionId: orderData.transactionId,
      paymentProof: orderData.paymentProof || null,
      subtotal: orderData.subtotal,
      deliveryFee: orderData.deliveryFee,
      tax: orderData.tax,
      total: orderData.total
    };
    
    return { ...newOrder };
  },

  async updateStatus(id, status) {
    await delay(400);
    const index = orderData.findIndex(o => o.Id === id);
    if (index === -1) {
      throw new Error("Order not found");
    }
    
    const updatedOrder = {
      ...orderData[index],
      status,
      updatedAt: new Date().toISOString()
    };
    
    return { ...updatedOrder };
  },

  async delete(id) {
    await delay(300);
    const index = orderData.findIndex(o => o.Id === id);
    if (index === -1) {
      throw new Error("Order not found");
    }
    return { success: true };
  }
};