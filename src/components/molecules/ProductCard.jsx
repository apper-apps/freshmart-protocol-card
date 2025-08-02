import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import ApperIcon from "@/components/ApperIcon";
import Cart from "@/components/pages/Cart";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, isInCart, getCartItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [isHovered, setIsHovered] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Memoize variant ID to prevent render-phase recalculations
  const variantId = useMemo(() => {
    return selectedVariant ? `${product.Id}-${JSON.stringify(selectedVariant)}` : product.Id;
  }, [product.Id, selectedVariant]);

  // Memoize discount calculation
  const discountPercentage = useMemo(() => {
    return product.originalPrice 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;
  }, [product.originalPrice, product.price]);

  // Memoize cart status to prevent render-phase state queries
  const isProductInCart = useMemo(() => {
    return isInCart(variantId);
  }, [isInCart, variantId]);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const productToAdd = {
      ...product,
      selectedVariant,
      variantId
    };
    addToCart(productToAdd, quantity);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.Id}`);
  };

  const handleVariantChange = (e, variant) => {
    e.stopPropagation();
    setSelectedVariant(variant);
  };
  return (
<Card 
      hover 
      onClick={handleCardClick} 
      className="p-4 h-full flex flex-col product-card-hover cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative mb-4">
        <div className="aspect-square rounded-lg overflow-hidden bg-surface-100 relative group">
          <img
            src={product.image}
            alt={product.title}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
            loading="lazy"
          />
          
          {/* Zoom overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center transition-opacity duration-300">
              <div className="bg-white bg-opacity-90 rounded-full p-2">
                <ApperIcon name="ZoomIn" size={20} className="text-gray-700" />
              </div>
            </div>
          )}
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.isNew && (
            <Badge variant="success" size="sm" className="shadow-md">New</Badge>
          )}
          {discountPercentage > 0 && (
            <Badge variant="error" size="sm" className="shadow-md">
              {discountPercentage}% OFF
            </Badge>
          )}
          {product.isBestseller && (
            <Badge variant="warning" size="sm" className="shadow-md">Bestseller</Badge>
          )}
        </div>

        {/* Stock indicator */}
        <div className="absolute top-2 right-2 z-10">
          {product.stock === 0 ? (
            <Badge variant="error" size="sm" className="shadow-md">
              Out of Stock
            </Badge>
          ) : product.stock < 10 ? (
            <Badge variant="warning" size="sm" className="shadow-md">
              Only {product.stock} left
            </Badge>
          ) : product.stock < 50 ? (
            <Badge variant="info" size="sm" className="shadow-md">
              <ApperIcon name="Package" size={12} className="mr-1" />
              {product.stock} in stock
            </Badge>
          ) : (
            <Badge variant="success" size="sm" className="shadow-md">
              <ApperIcon name="Check" size={12} className="mr-1" />
              In Stock
            </Badge>
          )}
        </div>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center z-20">
            <div className="text-center">
              <Badge variant="error" size="lg" className="mb-2">Out of Stock</Badge>
              <p className="text-white text-sm">Notify when available</p>
            </div>
          </div>
        )}
      </div>

<div className="flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-base leading-tight">
          {product.title}
        </h3>
        
        <p className="text-sm text-primary-600 font-medium mb-3">
          {product.category}
        </p>

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Available variants:</p>
            <div className="flex flex-wrap gap-1">
              {product.variants.slice(0, 3).map((variant, index) => (
                <button
                  key={index}
                  onClick={(e) => handleVariantChange(e, variant)}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    selectedVariant === variant
                      ? 'bg-primary-100 border-primary-300 text-primary-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {variant.size || variant.weight || variant.color || variant.count || variant.name}
                </button>
              ))}
              {product.variants.length > 3 && (
                <span className="px-2 py-1 text-xs text-gray-400">
                  +{product.variants.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold gradient-text">
            RS {product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              RS {product.originalPrice.toLocaleString()}
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="text-xs text-green-600 font-medium">
              Save RS {(product.originalPrice - product.price).toLocaleString()}
            </span>
          )}
        </div>

{/* Quantity selector for variants */}
        {selectedVariant && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-gray-600">Qty:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity(Math.max(1, quantity - 1));
                }}
                className="w-6 h-6 flex items-center justify-center border rounded text-xs hover:bg-gray-50"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity(Math.min(product.stock, quantity + 1));
                }}
                className="w-6 h-6 flex items-center justify-center border rounded text-xs hover:bg-gray-50"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>
        )}

        <div className="mt-auto space-y-2">
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full transition-all duration-300 ${
              isProductInCart ? 'cart-bounce' : ''
            }`}
            size="sm"
            variant={isProductInCart ? "success" : "primary"}
          >
            {isProductInCart ? (
              <>
                <ApperIcon name="Check" size={16} className="mr-2" />
                Added to Cart
              </>
            ) : (
              <>
                <ApperIcon name="ShoppingCart" size={16} className="mr-2" />
                Add to Cart
              </>
            )}
          </Button>
          
          {/* Quick buy option */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(e);
              navigate('/cart');
            }}
            disabled={product.stock === 0}
            className="w-full"
            variant="outline"
            size="sm"
          >
            <ApperIcon name="Zap" size={14} className="mr-2" />
            Quick Buy
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;