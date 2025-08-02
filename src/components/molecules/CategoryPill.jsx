import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const CategoryPill = ({ 
  category, 
  isActive = false, 
  onClick,
  showCount = false
}) => {
  return (
    <button
      onClick={() => onClick(category)}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
        isActive 
          ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg transform scale-105" 
          : "bg-white text-gray-700 border border-surface-300 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
      )}
    >
      <ApperIcon name={category.icon} size={16} />
      <span>{category.name}</span>
      {showCount && category.count > 0 && (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-xs",
          isActive ? "bg-white/20" : "bg-surface-200"
        )}>
          {category.count}
        </span>
      )}
    </button>
  );
};

export default CategoryPill;