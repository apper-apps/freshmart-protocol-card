import orderData from "@/services/mockData/orders.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock delivery locations for demonstration
const deliveryLocations = {
  1: { lat: 31.5497, lng: 74.3436, address: "House 123, Street 5, Block A, DHA Phase 5, Lahore" },
  2: { lat: 24.8607, lng: 67.0011, address: "Flat 45, Building C, Gulberg, Karachi" },
  3: { lat: 33.6844, lng: 73.0479, address: "House 67, Main Boulevard, F-8, Islamabad" },
  4: { lat: 31.5204, lng: 74.3587, address: "House 23, Garden Town, Lahore" },
  5: { lat: 24.8615, lng: 67.0099, address: "Apartment 12, Tower B, Clifton, Karachi" }
};

export const deliveryService = {
  async getDeliveryOrders() {
    await delay(400);
    // Return orders that are ready for delivery (packed, shipped, or delivered)
    const deliveryOrders = orderData
      .filter(order => ['packed', 'shipped', 'delivered'].includes(order.status))
      .map(order => ({
        ...order,
        location: deliveryLocations[order.Id] || { lat: 31.5497, lng: 74.3436 }
      }))
      .sort((a, b) => {
        const statusOrder = { 'packed': 1, 'shipped': 2, 'delivered': 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
    
    return deliveryOrders;
  },

  async getOrderById(id) {
    await delay(300);
    const order = orderData.find(o => o.Id === id);
    if (!order) {
      throw new Error("Order not found");
    }
    return {
      ...order,
      location: deliveryLocations[order.Id] || { lat: 31.5497, lng: 74.3436 }
    };
  },

  async updateOrderStatus(id, status, notes = '') {
    await delay(500);
    const index = orderData.findIndex(o => o.Id === id);
    if (index === -1) {
      throw new Error("Order not found");
    }

    const validStatuses = ['packed', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status");
    }

    const updatedOrder = {
      ...orderData[index],
      status,
      updatedAt: new Date().toISOString(),
      deliveryNotes: notes,
      statusHistory: [
        ...(orderData[index].statusHistory || []),
        {
          status,
          timestamp: new Date().toISOString(),
          notes
        }
      ]
    };

    // Update the mock data
    orderData[index] = updatedOrder;

    return {
      ...updatedOrder,
      location: deliveryLocations[id] || { lat: 31.5497, lng: 74.3436 }
    };
  },

  async getCurrentLocation() {
    await delay(200);
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            // Fallback to Lahore, Pakistan if geolocation fails
            resolve({
              lat: 31.5497,
              lng: 74.3436
            });
          }
        );
      } else {
        // Fallback location
        resolve({
          lat: 31.5497,
          lng: 74.3436
        });
      }
    });
  },

  async getRouteOptimization(orders) {
    await delay(600);
    // Simple route optimization - sort by proximity
    // In a real app, this would use a routing service
    const optimizedRoute = [...orders].sort((a, b) => {
      // Sort by status priority, then by creation date
      const statusOrder = { 'packed': 1, 'shipped': 2, 'delivered': 3 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    return optimizedRoute;
  }
};