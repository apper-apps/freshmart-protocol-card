import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import { useCart } from "@/hooks/useCart";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

const navItems = [
    { path: "/", label: "Home", icon: "Home" },
    { path: "/categories", label: "Categories", icon: "Grid3X3" },
    { path: "/cart", label: "Cart", icon: "ShoppingCart", badge: totalItems },
    { path: "/pos", label: "POS", icon: "Scan" },
    { path: "/delivery", label: "Delivery", icon: "Truck" },
    { path: "/orders", label: "Orders", icon: "Package" },
    { path: "/account", label: "Account", icon: "User" }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 z-50 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1",
                isActive
                  ? "text-primary-700 bg-primary-50 transform scale-105"
                  : "text-gray-600 hover:text-primary-600 hover:bg-primary-50"
              )}
            >
              <div className="relative">
                <ApperIcon 
                  name={item.icon} 
                  size={20} 
                  className={cn(
                    "transition-colors duration-200",
                    isActive && "text-primary-700"
                  )} 
                />
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-accent-500 to-accent-400 text-gray-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-xs font-medium truncate",
                isActive && "text-primary-700"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;