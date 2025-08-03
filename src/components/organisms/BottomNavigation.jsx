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
<nav className="nav-container fixed bottom-0 left-0 right-0 w-full bg-white border-t border-surface-200 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-[1000] pb-safe safe-bottom">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
<button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-3 rounded-xl transition-all duration-300 min-w-0 flex-1 min-h-[64px] touch-target nav-item-enhanced",
                isActive
                  ? "text-primary-800 bg-primary-100 transform scale-110 shadow-lg border-2 border-primary-200"
                  : "text-gray-600 hover:text-primary-600 hover:bg-primary-50 hover:scale-105 active:scale-95"
              )}
            >
              <div className="relative">
                <ApperIcon 
                  name={item.icon} 
                  size={22} 
                  className={cn(
                    "transition-all duration-300",
                    isActive && "text-primary-800 drop-shadow-sm"
                  )} 
                />
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-accent-500 to-accent-400 text-gray-900 text-xs rounded-full min-w-[20px] min-h-[20px] flex items-center justify-center font-bold animate-pulse">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-xs font-semibold truncate transition-colors duration-300",
                isActive && "text-primary-800"
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