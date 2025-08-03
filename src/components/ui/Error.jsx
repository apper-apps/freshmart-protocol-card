import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Error = ({ 
  message = "Something went wrong. Please try again.", 
  onRetry,
  showRetry = true,
  type = "general", // "general", "checkout", "cart"
  fallbackAction,
  fallbackLabel = "Go Back"
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <ApperIcon name="AlertCircle" size={32} className="text-red-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Oops! Something went wrong
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-sm">
        {message}
      </p>
      
<div className="flex flex-col sm:flex-row gap-3 items-center">
        {showRetry && onRetry && (
          <Button onClick={onRetry} className="px-6">
            <ApperIcon name="RefreshCw" size={16} className="mr-2" />
            Try Again
          </Button>
        )}
        
        {fallbackAction && (
          <Button 
            variant="outline" 
            onClick={fallbackAction} 
            className="px-6"
          >
            <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
            {fallbackLabel}
          </Button>
        )}
        
        {type === "checkout" && !fallbackAction && (
          <Button 
            variant="outline" 
            onClick={() => window.history.back()} 
            className="px-6"
          >
            <ApperIcon name="ShoppingCart" size={16} className="mr-2" />
            Return to Cart
          </Button>
        )}
      </div>
    </div>
  );
};

export default Error;