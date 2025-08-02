import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ 
  className, 
  children, 
  hover = false,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl bg-white shadow-sm border border-surface-200",
        hover && "product-card-hover cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;