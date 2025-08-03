import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import ApperIcon from "@/components/ApperIcon";
import { useCart } from "@/hooks/useCart";

const Header = () => {
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/categories?search=${encodeURIComponent(query)}`);
    }
  };

  return (
<header className="bg-white shadow-sm border-b border-surface-200 sticky top-0 z-[60] safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl flex items-center justify-center">
              <ApperIcon name="Leaf" size={24} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold font-display gradient-text">
                FreshMart Hub
              </h1>
              <p className="text-xs text-gray-600">Fresh Groceries Delivered</p>
            </div>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search icon for mobile */}
<Button
              variant="ghost"
              size="sm"
              className="md:hidden min-w-[48px] min-h-[48px] p-3 touch-target"
              onClick={() => navigate("/categories")}
            >
              <ApperIcon name="Search" size={20} />
            </Button>

            {/* Cart */}
<Button
              variant="ghost"
              size="sm"
              className="relative min-w-[48px] min-h-[48px] p-3 touch-target hover:bg-primary-100 active:scale-95"
              onClick={() => navigate("/cart")}
            >
              <ApperIcon name="ShoppingCart" size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-accent-500 to-accent-400 text-gray-900 text-xs rounded-full min-w-[24px] min-h-[24px] flex items-center justify-center font-bold animate-bounce-subtle">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Button>

            {/* Account */}
<Button
              variant="ghost"
              size="sm"
              className="min-w-[48px] min-h-[48px] p-3 touch-target hover:bg-primary-100 active:scale-95"
              onClick={() => navigate("/account")}
            >
              <ApperIcon name="User" size={22} />
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>
    </header>
  );
};

export default Header;