import orderData from "@/services/mockData/orders.json";
import productData from "@/services/mockData/products.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const adminService = {
  async getStats() {
    await delay(300);
    
    const totalOrders = orderData.length;
    const totalProducts = productData.length;
    const pendingOrders = orderData.filter(o => o.status === "pending").length;
    const totalRevenue = orderData
      .filter(o => o.status === "delivered")
      .reduce((sum, order) => sum + order.total, 0);
    
    return {
      totalOrders,
      totalProducts,
      pendingOrders,
      totalRevenue
    };
  },

  async getPendingOrders() {
    await delay(400);
    return orderData
      .filter(o => o.status === "pending")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getProducts() {
    await delay(300);
    return [...productData].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  },

  async addProduct(newProduct) {
    await delay(500);
    const newId = Math.max(...productData.map(p => p.Id)) + 1;
    const product = {
      Id: newId,
      ...newProduct,
      createdAt: new Date().toISOString(),
      isActive: true,
      isFeatured: false,
      isBestseller: false,
      isNew: true
    };
    
    return { ...product };
  },

  async updateProduct(id, updatedData) {
    await delay(400);
    const index = productData.findIndex(p => p.Id === id);
    if (index === -1) {
      throw new Error("Product not found");
    }
    
    const updatedProduct = {
      ...productData[index],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...updatedProduct };
  },

  async verifyPayment(orderId) {
    await delay(400);
    const index = orderData.findIndex(o => o.Id === orderId);
    if (index === -1) {
      throw new Error("Order not found");
    }
    
    const updatedOrder = {
      ...orderData[index],
      status: "payment_verified",
      updatedAt: new Date().toISOString()
    };
    
    return { ...updatedOrder };
  },

  async rejectPayment(orderId, reason) {
    await delay(400);
    const index = orderData.findIndex(o => o.Id === orderId);
    if (index === -1) {
      throw new Error("Order not found");
    }
    
    const updatedOrder = {
      ...orderData[index],
      status: "payment_rejected",
      rejectionReason: reason,
      updatedAt: new Date().toISOString()
    };
    
    return { ...updatedOrder };
  }
};