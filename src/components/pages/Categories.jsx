import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import CategoryPill from "@/components/molecules/CategoryPill";
import ProductGrid from "@/components/organisms/ProductGrid";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { productService } from "@/services/api/productService";
import { categoryService } from "@/services/api/categoryService";

const Categories = () => {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const categoriesData = await categoryService.getAll();
      setCategories(categoriesData);
      
      let productsData = [];
      
      if (searchQuery) {
        productsData = await productService.search(searchQuery);
        setSelectedCategory(null);
      } else if (categoryId) {
        productsData = await productService.getByCategory(categoryId);
        const category = categoriesData.find(cat => cat.Id === parseInt(categoryId));
        setSelectedCategory(category);
      } else {
        productsData = await productService.getAll();
        setSelectedCategory(null);
      }
      
      setProducts(productsData);
    } catch (err) {
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryId, searchQuery]);

  const handleCategoryClick = (category) => {
    if (selectedCategory?.Id === category.Id) {
      setSelectedCategory(null);
      window.history.pushState({}, "", "/categories");
      loadAllProducts();
    } else {
      setSelectedCategory(category);
      window.history.pushState({}, "", `/categories/${category.Id}`);
      loadCategoryProducts(category.Id);
    }
  };

  const loadAllProducts = async () => {
    try {
      setLoading(true);
      const productsData = await productService.getAll();
      setProducts(productsData);
    } catch (err) {
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryProducts = async (catId) => {
    try {
      setLoading(true);
      const productsData = await productService.getByCategory(catId);
      setProducts(productsData);
    } catch (err) {
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (categories.length === 0 && !loading && !error) {
    return (
      <Error 
        message="No categories available."
        showRetry={false}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
          {searchQuery ? `Search Results for "${searchQuery}"` :
           selectedCategory ? selectedCategory.name : "All Products"}
        </h1>
        {selectedCategory && (
          <p className="text-gray-600">
            {products.length} {products.length === 1 ? "product" : "products"} found
          </p>
        )}
      </div>

      {/* Categories Filter */}
      {!searchQuery && categories.length > 0 && (
        <div className="px-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <CategoryPill
              category={{ name: "All", icon: "Grid3X3" }}
              isActive={!selectedCategory}
              onClick={() => handleCategoryClick({ name: "All" })}
            />
            {categories.map((category) => (
              <CategoryPill
                key={category.Id}
                category={category}
                isActive={selectedCategory?.Id === category.Id}
                onClick={handleCategoryClick}
                showCount
              />
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <ProductGrid
        products={products}
        loading={loading}
        error={error}
        onRetry={loadData}
      />
    </div>
  );
};

export default Categories;