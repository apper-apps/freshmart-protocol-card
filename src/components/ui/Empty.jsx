import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Empty = ({ 
  title = "Nothing here yet",
  message = "We'll add more items soon!",
  icon = "Package",
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
        <ApperIcon name={icon} size={40} className="text-primary-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-sm">
        {message}
      </p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} className="px-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default Empty;