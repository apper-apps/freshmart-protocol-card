import orderData from "@/services/mockData/orders.json";
import productData from "@/services/mockData/products.json";
import { toast } from "react-toastify";
import React from "react";
import Error from "@/components/ui/Error";

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

  async confirmProductAvailability(orderId, itemIndex, available) {
    await delay(300);
    const orderIndex = orderData.findIndex(o => o.Id === orderId);
    if (orderIndex === -1) {
      throw new Error("Order not found");
    }
    
    const order = orderData[orderIndex];
    if (itemIndex >= order.items.length) {
      throw new Error("Item not found");
    }
    
    // Update the item availability
    order.items[itemIndex].available = available;
    order.updatedAt = new Date().toISOString();
    
    return { success: true };
  },

  async assignDeliveryPersonnel(orderId, deliveryInfo) {
    await delay(400);
    const orderIndex = orderData.findIndex(o => o.Id === orderId);
    if (orderIndex === -1) {
      throw new Error("Order not found");
    }
    
    const updatedOrder = {
      ...orderData[orderIndex],
      deliveryPersonnel: {
        name: deliveryInfo.name,
        phone: deliveryInfo.phone,
        vehicleNumber: deliveryInfo.vehicleNumber || null,
        estimatedTime: deliveryInfo.estimatedTime || null,
        assignedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    };
    
    orderData[orderIndex] = updatedOrder;
    return { ...updatedOrder };
  },

  async requestPayment(orderId) {
    await delay(500);
    const orderIndex = orderData.findIndex(o => o.Id === orderId);
    if (orderIndex === -1) {
      throw new Error("Order not found");
    }
    
    const updatedOrder = {
      ...orderData[orderIndex],
      paymentRequested: true,
      paymentRequestDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    orderData[orderIndex] = updatedOrder;
    
    // Simulate admin notification
    console.log("Payment request sent to admin for order:", orderId);
    
    return { success: true, message: "Payment request sent successfully" };
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