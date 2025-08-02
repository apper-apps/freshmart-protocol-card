import React from "react";

const Loading = ({ type = "default" }) => {
  if (type === "products") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-4 animate-pulse">
            <div className="aspect-square bg-surface-300 rounded-lg mb-3"></div>
            <div className="h-4 bg-surface-300 rounded mb-2"></div>
            <div className="h-3 bg-surface-300 rounded w-2/3 mb-2"></div>
            <div className="h-5 bg-surface-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "orders") {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-4 animate-pulse">
            <div className="flex justify-between items-start mb-3">
              <div className="h-4 bg-surface-300 rounded w-24"></div>
              <div className="h-6 bg-surface-300 rounded w-20"></div>
            </div>
            <div className="h-3 bg-surface-300 rounded w-full mb-2"></div>
            <div className="h-3 bg-surface-300 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-surface-300 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-primary-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    </div>
  );
};

export default Loading;