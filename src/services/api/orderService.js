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
    const newId = Math.max(...orderData.map(o => o.Id)) + 1;
    const newOrder = {
      Id: newId,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...orderData
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