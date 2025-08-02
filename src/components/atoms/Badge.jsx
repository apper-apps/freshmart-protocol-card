import React from "react";
import { cn } from "@/utils/cn";

const Badge = ({ 
  children, 
  variant = "default", 
  size = "sm",
  className 
}) => {
  const variants = {
    default: "bg-surface-300 text-gray-700",
    primary: "bg-gradient-to-r from-primary-600 to-primary-500 text-white",
    success: "bg-gradient-to-r from-green-600 to-green-500 text-white",
    warning: "bg-gradient-to-r from-accent-500 to-accent-400 text-gray-900",
    error: "bg-gradient-to-r from-red-600 to-red-500 text-white",
    info: "bg-gradient-to-r from-blue-600 to-blue-500 text-white",
    outline: "border border-surface-300 bg-white text-gray-700"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium shadow-sm",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;