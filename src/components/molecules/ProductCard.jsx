import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { useCart } from "@/hooks/useCart";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.Id}`);
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card hover onClick={handleCardClick} className="p-4 h-full flex flex-col">
      <div className="relative mb-3">
        <div className="aspect-square rounded-lg overflow-hidden bg-surface-100">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <Badge variant="success" size="sm">New</Badge>
          )}
          {discountPercentage > 0 && (
            <Badge variant="error" size="sm">{discountPercentage}% OFF</Badge>
          )}
          {product.isBestseller && (
            <Badge variant="warning" size="sm">Bestseller</Badge>
          )}
        </div>

        {/* Stock indicator */}
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute top-2 right-2">
            <Badge variant="warning" size="sm">
              Only {product.stock} left
            </Badge>
          </div>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
            <Badge variant="error">Out of Stock</Badge>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
          {product.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
          {product.category}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold gradient-text">
            RS {product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              RS {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        <div className="mt-auto">
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full"
            size="sm"
          >
            {isInCart(product.Id) ? (
              <>
                <ApperIcon name="Check" size={16} className="mr-2" />
                Added
              </>
            ) : (
              <>
                <ApperIcon name="Plus" size={16} className="mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;