import productData from "@/services/mockData/products.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Enhance product data with high-resolution images
const enhanceProductData = (products) => {
  return products.map(product => ({
    ...product,
    image: product.image + "&q=90&auto=format", // High quality
    images: product.images?.map(img => img + "&q=90&auto=format") || [product.image + "&q=90&auto=format"],
    variants: product.variants || [],
    stockStatus: product.stock === 0 ? 'out_of_stock' 
      : product.stock < 10 ? 'low_stock' 
      : product.stock < 50 ? 'in_stock' 
      : 'high_stock'
  }));
};

export const productService = {
  async getAll() {
    await delay(300);
    return enhanceProductData([...productData]);
  },

  async getById(id) {
    await delay(200);
    const product = productData.find(p => p.Id === id);
    if (!product) {
      throw new Error("Product not found");
    }
    return enhanceProductData([{ ...product }])[0];
  },

  async getByBarcode(barcode) {
    await delay(200);
    // For demo, use product ID as barcode or generate from product data
    const product = productData.find(p => 
      p.barcode === barcode || 
      p.Id.toString() === barcode ||
      p.title.toLowerCase().includes(barcode.toLowerCase())
    );
    if (!product) {
      throw new Error("Product not found by barcode");
    }
    return enhanceProductData([{ ...product }])[0];
  },

  async getByCategory(categoryId) {
    await delay(250);
    const filtered = productData.filter(p => p.categoryId === categoryId);
    return enhanceProductData([...filtered]);
  },

  async getFeatured() {
    await delay(200);
    const featured = productData.filter(p => p.isFeatured);
    return enhanceProductData([...featured]);
  },

  async getBestsellers() {
    await delay(200);
    const bestsellers = productData.filter(p => p.isBestseller);
    return enhanceProductData([...bestsellers]);
  },

  async search(query) {
    await delay(300);
    const searchTerm = query.toLowerCase();
    const results = productData.filter(p => 
      p.title.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    );
    return enhanceProductData([...results]);
  },


async create(newProductData) {
    await delay(500);
    const newId = Math.max(...productData.map(p => p.Id)) + 1;
    const newProduct = {
      Id: newId,
      ...newProductData,
      barcode: newProductData.barcode || `BC${newId.toString().padStart(6, '0')}`,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    productData.push(newProduct);
    return { ...newProduct };
  },

  async updateStock(id, newStock) {
    await delay(300);
    const index = productData.findIndex(p => p.Id === id);
    if (index === -1) {
      throw new Error("Product not found");
    }
    
    productData[index] = {
      ...productData[index],
      stock: newStock,
      updatedAt: new Date().toISOString()
    };
    
    return { ...productData[index] };
  },

async update(id, updatedData) {
    await delay(400);
    const index = productData.findIndex(p => p.Id === id);
    if (index === -1) {
      throw new Error("Product not found");
    }
    
    productData[index] = {
      ...productData[index],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...productData[index] };
  },

  async searchProducts(query) {
    await delay(200);
    const results = productData.filter(p => 
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      (p.barcode && p.barcode.includes(query))
    );
    return enhanceProductData([...results]);
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