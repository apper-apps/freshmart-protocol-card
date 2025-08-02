import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const OrderStatusTimeline = ({ order }) => {
  const statuses = [
    { key: "pending", label: "Order Placed", icon: "ShoppingCart" },
    { key: "payment_verified", label: "Payment Verified", icon: "CreditCard" },
    { key: "packed", label: "Packed", icon: "Package" },
    { key: "shipped", label: "Shipped", icon: "Truck" },
    { key: "delivered", label: "Delivered", icon: "CheckCircle" }
  ];

  const currentStatusIndex = statuses.findIndex(status => status.key === order.status);

  return (
    <div className="relative">
      {statuses.map((status, index) => {
        const isCompleted = index <= currentStatusIndex;
        const isCurrent = index === currentStatusIndex;
        const isLast = index === statuses.length - 1;

        return (
          <div key={status.key} className="relative flex items-center">
            <div className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  isCompleted
                    ? "bg-gradient-to-r from-primary-600 to-primary-500 border-primary-500 text-white"
                    : "bg-white border-surface-300 text-gray-400"
                )}
              >
                <ApperIcon 
                  name={isCompleted ? "Check" : status.icon} 
                  size={20} 
                />
              </div>
              
              <div className="ml-4">
                <p className={cn(
                  "font-medium text-sm",
                  isCompleted ? "text-gray-900" : "text-gray-500"
                )}>
                  {status.label}
                </p>
                {isCurrent && order.updatedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(order.updatedAt), "MMM dd, yyyy 'at' HH:mm")}
                  </p>
                )}
              </div>
            </div>
            
            {!isLast && (
              <div
                className={cn(
                  "absolute left-5 top-10 w-0.5 h-8 transition-all duration-300",
                  isCompleted ? "bg-primary-500" : "bg-surface-300"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderStatusTimeline;