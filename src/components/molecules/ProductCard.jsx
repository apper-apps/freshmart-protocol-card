import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize selectedVariant after mount to prevent setState during render
  useEffect(() => {
    if (!isInitialized && product?.variants?.length > 0) {
      setSelectedVariant(product.variants[0]);
      setIsInitialized(true);
    } else if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [product?.variants, isInitialized]);
  // Memoize variant ID to prevent render-phase recalculations
const variantId = useMemo(() => {
    return selectedVariant ? `${product.Id}-${JSON.stringify(selectedVariant)}` : product.Id;
  }, [product.Id, selectedVariant]);

  // Calculate current price with variant modifier
  const currentPrice = useMemo(() => {
    let basePrice = product.price;
    if (selectedVariant && selectedVariant.priceModifier) {
      basePrice += selectedVariant.priceModifier;
    }
    return basePrice;
  }, [product.price, selectedVariant]);

  // Memoize discount calculation with current price
  const discountPercentage = useMemo(() => {
    return product.originalPrice 
      ? Math.round(((product.originalPrice - currentPrice) / product.originalPrice) * 100)
      : 0;
  }, [product.originalPrice, currentPrice]);

  const savings = useMemo(() => {
    return product.originalPrice > currentPrice ? product.originalPrice - currentPrice : 0;
  }, [product.originalPrice, currentPrice]);

  // Memoize cart status to prevent render-phase state queries
  const isProductInCart = useMemo(() => {
    return isInCart(variantId);
  }, [isInCart, variantId]);

  const handleAddToCart = (e) => {
e.stopPropagation();
    const productToAdd = {
      ...product,
      selectedVariant,
      variantId,
      price: currentPrice // Use current price with variant modifier
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
                  className={`min-h-[48px] px-3 py-2 text-xs rounded-lg border transition-all duration-300 variant-button-enhanced ${
                    selectedVariant === variant
                      ? 'bg-primary-100 border-2 border-primary-500 text-primary-800 ring-2 ring-primary-200 transform scale-105 shadow-lg variant-selected'
                      : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600 hover:scale-102 active:scale-95'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {variant.size || variant.weight || variant.color || variant.count || variant.name}
                    {selectedVariant === variant && (
                      <ApperIcon name="Check" size={12} className="text-primary-700 animate-scale-in" />
                    )}
                  </div>
                  {variant.priceModifier && variant.priceModifier !== 0 && (
                    <div className="text-xs text-gray-500 mt-1 font-medium">
                      ({variant.priceModifier > 0 ? '+' : ''}RS {Math.abs(variant.priceModifier)})
                    </div>
                  )}
                </button>
              ))}
              {product.variants.length > 3 && (
                <span className="px-3 py-2 text-xs text-gray-400 min-h-[48px] flex items-center">
                  +{product.variants.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

<div className="flex items-center flex-wrap gap-2 mb-4">
          <span className="text-xl font-bold gradient-text transition-all duration-500 price-change-animation">
            RS {currentPrice.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > currentPrice && (
            <span className="text-sm text-gray-500 line-through transition-opacity duration-300">
              RS {product.originalPrice.toLocaleString()}
            </span>
          )}
          {savings > 0 && (
            <span className="text-xs text-green-700 font-bold bg-gradient-to-r from-green-100 to-green-50 px-3 py-1.5 rounded-full border border-green-200 animate-bounce-subtle savings-badge">
              💰 Save RS {savings.toLocaleString()}
            </span>
          )}
        </div>

{/* Quantity selector for variants */}
{selectedVariant && (
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-600 font-medium">Qty:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity(Math.max(1, quantity - 1));
                }}
                className={`min-w-[48px] min-h-[48px] flex items-center justify-center border rounded-lg text-sm transition-all duration-200 touch-target ${
                  quantity <= 1 
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600 active:scale-95 hover:shadow-md'
                }`}
                disabled={quantity <= 1}
              >
                <ApperIcon name="Minus" size={16} />
              </button>
              <span className="min-w-[48px] min-h-[36px] flex items-center justify-center text-base font-bold bg-surface-50 rounded-lg px-2 border">
                {quantity}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity(Math.min(product.stock, quantity + 1));
                }}
                className={`min-w-[48px] min-h-[48px] flex items-center justify-center border rounded-lg text-sm transition-all duration-200 touch-target ${
                  quantity >= product.stock 
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600 active:scale-95 hover:shadow-md'
                }`}
                disabled={quantity >= product.stock}
              >
                <ApperIcon name="Plus" size={16} />
              </button>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              (Stock: {product.stock})
            </span>
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