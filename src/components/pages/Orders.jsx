import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { orderService } from "@/services/api/orderService";
import { format } from "date-fns";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const ordersData = await orderService.getAll();
      setOrders(ordersData);
    } catch (err) {
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusVariant = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "payment_verified":
        return "info";
      case "packed":
        return "primary";
      case "shipped":
        return "primary";
      case "delivered":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Payment Pending";
      case "payment_verified":
        return "Payment Verified";
      case "packed":
        return "Packed";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  if (loading) {
    return <Loading type="orders" />;
  }

  if (error) {
    return (
      <div className="p-4">
        <Error 
          message={error} 
          onRetry={loadOrders}
        />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-4">
        <Empty
          title="No orders yet"
          message="Start shopping to see your orders here!"
          icon="Package"
          actionLabel="Start Shopping"
          onAction={() => navigate("/categories")}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display text-gray-900">
          My Orders
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadOrders}
        >
          <ApperIcon name="RefreshCw" size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card 
            key={order.Id} 
            hover
            onClick={() => navigate(`/orders/${order.Id}`)}
            className="p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">
                    Order #{order.Id.toString().padStart(6, "0")}
                  </h3>
                  <Badge variant={getStatusVariant(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Placed on {format(new Date(order.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold gradient-text">
                  RS {order.total.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  {order.items.length} {order.items.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {order.items.slice(0, 4).map((item, index) => (
                <div key={index} className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-surface-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {order.items.length > 4 && (
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-surface-200 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    +{order.items.length - 4}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ApperIcon name="MapPin" size={14} />
                <span className="truncate max-w-[200px]">
                  {order.deliveryAddress.city}
                </span>
              </div>
              <div className="flex gap-2">
                {order.status === "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle payment upload
                    }}
                  >
                    <ApperIcon name="Upload" size={14} className="mr-1" />
                    Upload Payment
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/orders/${order.Id}`);
                  }}
                >
                  View Details
                  <ApperIcon name="ArrowRight" size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Orders;