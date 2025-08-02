import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  children, 
  disabled,
  ...props 
}, ref) => {
  const variants = {
    primary: "bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-white hover:bg-surface-100 text-primary-700 border border-primary-200 hover:border-primary-300",
    outline: "border border-surface-300 hover:border-primary-300 bg-white hover:bg-primary-50 text-gray-700 hover:text-primary-700",
    ghost: "hover:bg-primary-50 text-primary-700 hover:text-primary-800",
    accent: "bg-gradient-to-r from-accent-500 to-accent-400 hover:from-accent-600 hover:to-accent-500 text-gray-900 shadow-lg hover:shadow-xl"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]",
        variants[variant],
        sizes[size],
        disabled && "hover:scale-100 active:scale-100",
        className
      )}
      disabled={disabled}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;