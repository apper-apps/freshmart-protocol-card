import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import OrderStatusTimeline from "@/components/molecules/OrderStatusTimeline";
import ApperIcon from "@/components/ApperIcon";
import { orderService } from "@/services/api/orderService";
import { format } from "date-fns";

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const orderData = await orderService.getById(parseInt(orderId));
      setOrder(orderData);
    } catch (err) {
      setError("Failed to load order details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  if (loading) {
    return <Loading />;
  }

  if (error || !order) {
    return (
      <div className="p-4">
        <Error
          message={error || "Order not found"}
          onRetry={loadOrder}
        />
      </div>
    );
  }

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

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/orders")}
        >
          <ApperIcon name="ArrowLeft" size={20} className="mr-2" />
          Back to Orders
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
                  Order #{order.Id.toString().padStart(6, "0")}
                </h1>
                <p className="text-gray-600">
                  Placed on {format(new Date(order.createdAt), "MMMM dd, yyyy 'at' HH:mm")}
                </p>
              </div>
              <Badge variant={getStatusVariant(order.status)} size="lg">
                {getStatusLabel(order.status)}
              </Badge>
            </div>

            {/* Order Timeline */}
            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-4">Order Status</h3>
              <OrderStatusTimeline order={order} />
            </div>
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Order Items ({order.items.length})
            </h3>
            
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-surface-50 rounded-lg">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-100 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-1 truncate">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {item.category}
                    </p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      RS {(item.price * item.quantity).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      RS {item.price.toLocaleString()} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Delivery Address */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ApperIcon name="MapPin" size={20} className="text-primary-600" />
              <h3 className="font-semibold text-gray-900">Delivery Address</h3>
            </div>
            
            <div className="space-y-2">
              <p className="font-medium text-gray-900">
                {order.deliveryAddress.fullName}
              </p>
              <p className="text-gray-600">
                {order.deliveryAddress.phone}
              </p>
              <p className="text-gray-600">
                {order.deliveryAddress.address}
              </p>
              <p className="text-gray-600">
                {order.deliveryAddress.city} {order.deliveryAddress.area}
              </p>
              {order.deliveryAddress.landmarks && (
                <p className="text-sm text-gray-500">
                  Landmarks: {order.deliveryAddress.landmarks}
                </p>
              )}
            </div>
          </Card>

          {/* Payment Information */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ApperIcon name="CreditCard" size={20} className="text-primary-600" />
              <h3 className="font-semibold text-gray-900">Payment Information</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                <p className="font-medium text-gray-900 capitalize">
                  {order.paymentMethod.replace("_", " ")}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                <p className="font-medium text-gray-900">
                  {order.transactionId}
                </p>
              </div>
            </div>

            {order.paymentProof && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Payment Screenshot</p>
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-surface-100">
                  <img
                    src={order.paymentProof}
                    alt="Payment proof"
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(order.paymentProof, "_blank")}
                  />
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">
              Order Summary
            </h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>RS {order.subtotal.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>
                  {order.deliveryFee === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    `RS ${order.deliveryFee}`
                  )}
                </span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>RS {order.tax.toLocaleString()}</span>
              </div>
              
              <div className="border-t border-surface-200 pt-3">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>RS {order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {order.status === "pending" && (
                <Button className="w-full">
                  <ApperIcon name="Upload" size={16} className="mr-2" />
                  Upload Payment Proof
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => navigate("/categories")}
                className="w-full"
              >
                <ApperIcon name="ShoppingCart" size={16} className="mr-2" />
                Order Again
              </Button>
              
              {order.status === "delivered" && (
                <Button
                  variant="outline"
                  className="w-full"
                >
                  <ApperIcon name="MessageCircle" size={16} className="mr-2" />
                  Leave Review
                </Button>
              )}
            </div>

            {/* Help Section */}
            <div className="mt-6 pt-6 border-t border-surface-200">
              <h4 className="font-medium text-gray-900 mb-3">Need Help?</h4>
              <div className="space-y-2 text-sm">
                <button className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
                  <ApperIcon name="Phone" size={14} />
                  Contact Support
                </button>
                <button className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
                  <ApperIcon name="MessageCircle" size={14} />
                  Live Chat
                </button>
                <button className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
                  <ApperIcon name="HelpCircle" size={14} />
                  Order FAQ
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;