import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import CategoryPill from "@/components/molecules/CategoryPill";
import ProductGrid from "@/components/organisms/ProductGrid";
import ApperIcon from "@/components/ApperIcon";
import { productService } from "@/services/api/productService";
import { categoryService } from "@/services/api/categoryService";

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productsData, categoriesData] = await Promise.all([
        productService.getFeatured(),
        categoryService.getAll()
      ]);
      
      setFeaturedProducts(productsData);
      setCategories(categoriesData.slice(0, 6)); // Show only first 6 categories
    } catch (err) {
      setError("Failed to load home data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCategoryClick = (category) => {
    navigate(`/categories/${category.Id}`);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 mx-4 mt-4 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative h-full flex items-center justify-between px-6">
          <div className="text-white">
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-2">
              Fresh Groceries
            </h2>
            <p className="text-primary-100 mb-4">
              Delivered to your doorstep
            </p>
            <Button 
              variant="accent"
              onClick={() => navigate("/categories")}
            >
              Shop Now
            </Button>
          </div>
          <div className="hidden md:block">
            <ApperIcon name="ShoppingBasket" size={120} className="text-white/20" />
          </div>
        </div>
      </div>

      {/* Quick Categories */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Shop by Category
          </h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/categories")}
          >
            View All
            <ApperIcon name="ArrowRight" size={16} className="ml-2" />
          </Button>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <CategoryPill
              key={category.Id}
              category={category}
              onClick={handleCategoryClick}
              showCount
            />
          ))}
        </div>
      </div>

      {/* Promotional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
        <Card className="p-6 bg-gradient-to-r from-accent-400 to-accent-300">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="default" className="mb-2">Today Only</Badge>
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                30% OFF
              </h4>
              <p className="text-gray-700 text-sm">
                On fresh vegetables
              </p>
            </div>
            <ApperIcon name="Carrot" size={48} className="text-gray-700" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-primary-100 to-primary-50">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="primary" className="mb-2">Free Delivery</Badge>
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                Orders over RS 1500
              </h4>
              <p className="text-gray-700 text-sm">
                Same day delivery
              </p>
            </div>
            <ApperIcon name="Truck" size={48} className="text-primary-600" />
          </div>
        </Card>
      </div>

      {/* Featured Products */}
      <div>
        <div className="flex items-center justify-between mb-4 px-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Featured Products
          </h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/categories")}
          >
            View All
            <ApperIcon name="ArrowRight" size={16} className="ml-2" />
          </Button>
        </div>

        <ProductGrid
          products={featuredProducts}
          loading={loading}
          error={error}
          onRetry={loadData}
        />
      </div>
    </div>
  );
};

export default Home;