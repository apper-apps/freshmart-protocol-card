import React from "react";
import ProductCard from "@/components/molecules/ProductCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";

const ProductGrid = ({ 
  products = [], 
  loading = false, 
  error = null,
  onRetry 
}) => {
  if (loading) {
    return <Loading type="products" />;
  }

  if (error) {
    return (
      <Error 
        message={error} 
        onRetry={onRetry}
        showRetry={!!onRetry}
      />
    );
  }

  if (products.length === 0) {
    return (
      <Empty
        title="No products found"
        message="Try adjusting your search or browse different categories."
        icon="Package"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {products.map((product) => (
        <ProductCard 
          key={product.Id} 
          product={product} 
        />
      ))}
    </div>
  );
};

export default ProductGrid;