import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { useCart } from "@/hooks/useCart";
import { productService } from "@/services/api/productService";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const productData = await productService.getById(parseInt(productId));
      setProduct(productData);
      
      if (productData.variants && productData.variants.length > 0) {
        setSelectedVariant(productData.variants[0]);
      }
    } catch (err) {
      setError("Failed to load product details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        ...product,
        quantity,
        selectedVariant
      });
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !product) {
    return (
      <Error 
        message={error || "Product not found"}
        onRetry={loadProduct}
      />
    );
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ApperIcon name="ArrowLeft" size={20} className="mr-2" />
        Back
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-surface-100 relative">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <Badge variant="success">New</Badge>
                )}
                {discountPercentage > 0 && (
                  <Badge variant="error">{discountPercentage}% OFF</Badge>
                )}
                {product.isBestseller && (
                  <Badge variant="warning">Bestseller</Badge>
                )}
              </div>

              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Badge variant="error" size="lg">Out of Stock</Badge>
                </div>
              )}
            </div>
          </Card>

          {/* Additional Images */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((image, index) => (
                <Card key={index} className="aspect-square p-2">
                  <img
                    src={image}
                    alt={`${product.title} ${index + 2}`}
                    className="w-full h-full object-cover rounded"
                  />
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-primary-600 font-medium mb-2">
              {product.category}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900 mb-4">
              {product.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold gradient-text">
                RS {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  RS {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <ApperIcon name="Package" size={16} />
                <span>Stock: {product.stock} units</span>
              </div>
              <div className="flex items-center gap-1">
                <ApperIcon name="Truck" size={16} />
                <span>Free delivery</span>
              </div>
            </div>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Choose Variant
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, index) => (
                  <Button
                    key={index}
                    variant={selectedVariant === variant ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setSelectedVariant(variant)}
                  >
                    {variant.size || variant.weight || variant.color || variant.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Quantity
            </h3>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <ApperIcon name="Minus" size={16} />
              </Button>
              <span className="w-12 text-center font-semibold">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                <ApperIcon name="Plus" size={16} />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1"
              variant="secondary"
            >
              {isInCart(product.Id) ? (
                <>
                  <ApperIcon name="Check" size={20} className="mr-2" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ApperIcon name="ShoppingCart" size={20} className="mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
            
            <Button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1"
            >
              <ApperIcon name="Zap" size={20} className="mr-2" />
              Buy Now
            </Button>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Vendor Info */}
          {product.vendor && (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <ApperIcon name="Store" size={20} className="text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {product.vendor.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Verified Vendor
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;