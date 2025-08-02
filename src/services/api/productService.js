import productData from "@/services/mockData/products.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const productService = {
  async getAll() {
    await delay(300);
    return [...productData];
  },

  async getById(id) {
    await delay(200);
    const product = productData.find(p => p.Id === id);
    if (!product) {
      throw new Error("Product not found");
    }
    return { ...product };
  },

  async getByCategory(categoryId) {
    await delay(300);
    const categoryIdNum = parseInt(categoryId);
    return productData.filter(p => p.categoryId === categoryIdNum);
  },

  async getFeatured() {
    await delay(300);
    return productData.filter(p => p.isFeatured || p.isBestseller).slice(0, 8);
  },

  async search(query) {
    await delay(400);
    const searchTerm = query.toLowerCase();
    return productData.filter(p => 
      p.title.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    );
  },

  async create(productData) {
    await delay(500);
    const newId = Math.max(...productData.map(p => p.Id)) + 1;
    const newProduct = {
      Id: newId,
      ...productData,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    return { ...newProduct };
  },

  async update(id, updatedData) {
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

  async delete(id) {
    await delay(300);
    const index = productData.findIndex(p => p.Id === id);
    if (index === -1) {
      throw new Error("Product not found");
    }
    return { success: true };
  }
};