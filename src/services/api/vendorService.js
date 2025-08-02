import orderData from "@/services/mockData/orders.json";
import productData from "@/services/mockData/products.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const vendorService = {
  async getOrders(vendorId = 1) {
    await delay(400);
    // Filter orders that contain products from this vendor
    const vendorOrders = orderData.filter(order => 
      order.items.some(item => item.vendorId === vendorId)
    );
    
    return vendorOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getProducts(vendorId = 1) {
    await delay(300);
    return productData.filter(p => p.vendorId === vendorId);
  },

  async updateOrderStatus(orderId, status) {
    await delay(400);
    const index = orderData.findIndex(o => o.Id === orderId);
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

  async updateProductStatus(productId, isActive) {
    await delay(300);
    const index = productData.findIndex(p => p.Id === productId);
    if (index === -1) {
      throw new Error("Product not found");
    }
    
    const updatedProduct = {
      ...productData[index],
      isActive,
      updatedAt: new Date().toISOString()
    };
    
    return { ...updatedProduct };
  },

  async updateProductPrice(productId, price) {
    await delay(400);
    const index = productData.findIndex(p => p.Id === productId);
    if (index === -1) {
      throw new Error("Product not found");
    }
    
    const updatedProduct = {
      ...productData[index],
      price,
      updatedAt: new Date().toISOString(),
      priceUpdatePending: true
    };
    
    return { ...updatedProduct };
  }
};