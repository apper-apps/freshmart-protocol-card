import categoryData from "@/services/mockData/categories.json";
import productData from "@/services/mockData/products.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const categoryService = {
  async getAll() {
    await delay(200);
    
    // Add product count to each category
    const categoriesWithCount = categoryData.map(category => {
      const count = productData.filter(p => p.categoryId === category.Id).length;
      return { ...category, count };
    });
    
    return categoriesWithCount;
  },

  async getById(id) {
    await delay(200);
    const category = categoryData.find(c => c.Id === id);
    if (!category) {
      throw new Error("Category not found");
    }
    
    const count = productData.filter(p => p.categoryId === category.Id).length;
    return { ...category, count };
  },

  async create(categoryData) {
    await delay(300);
    const newId = Math.max(...categoryData.map(c => c.Id)) + 1;
    const newCategory = {
      Id: newId,
      ...categoryData,
      createdAt: new Date().toISOString()
    };
    return { ...newCategory };
  },

  async update(id, updatedData) {
    await delay(400);
    const index = categoryData.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error("Category not found");
    }
    
    const updatedCategory = {
      ...categoryData[index],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...updatedCategory };
  },

  async delete(id) {
    await delay(300);
    const index = categoryData.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error("Category not found");
    }
    return { success: true };
  }
};