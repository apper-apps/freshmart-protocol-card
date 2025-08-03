import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { vendorService } from "@/services/api/vendorService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Orders from "@/components/pages/Orders";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const VendorDashboard = () => {
const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [deliveryPersonnel, setDeliveryPersonnel] = useState({
    name: "",
    phone: "",
    vehicleNumber: "",
    estimatedTime: ""
  });
  const [processingActions, setProcessingActions] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [ordersData, productsData] = await Promise.all([
        vendorService.getOrders(),
        vendorService.getProducts()
      ]);
      
      setOrders(ordersData);
      setProducts(productsData);
    } catch (err) {
      setError("Failed to load vendor data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

const handleConfirmAvailability = async (orderId, itemIndex, available) => {
    setProcessingActions(prev => ({ ...prev, [`${orderId}-${itemIndex}`]: true }));
    try {
      await vendorService.confirmProductAvailability(orderId, itemIndex, available);
      toast.success(`Product availability ${available ? 'confirmed' : 'updated'}`);
      loadData();
    } catch (err) {
      toast.error("Failed to update product availability");
    } finally {
      setProcessingActions(prev => ({ ...prev, [`${orderId}-${itemIndex}`]: false }));
    }
  };

  const handleMarkAsPacked = (orderId) => {
    setSelectedOrderId(orderId);
    setShowDeliveryModal(true);
  };

  const handleSubmitDeliveryDetails = async () => {
    if (!deliveryPersonnel.name || !deliveryPersonnel.phone) {
      toast.error("Please fill in delivery personnel name and phone");
      return;
    }

    setProcessingActions(prev => ({ ...prev, [selectedOrderId]: true }));
    try {
      await vendorService.assignDeliveryPersonnel(selectedOrderId, deliveryPersonnel);
      await vendorService.updateOrderStatus(selectedOrderId, "packed");
      toast.success("Order marked as packed and delivery assigned");
      setShowDeliveryModal(false);
      setDeliveryPersonnel({ name: "", phone: "", vehicleNumber: "", estimatedTime: "" });
      loadData();
    } catch (err) {
      toast.error("Failed to assign delivery personnel");
    } finally {
      setProcessingActions(prev => ({ ...prev, [selectedOrderId]: false }));
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    setProcessingActions(prev => ({ ...prev, [orderId]: true }));
    try {
      await vendorService.updateOrderStatus(orderId, status);
      toast.success(`Order status updated to ${status.replace('_', ' ')}`);
      loadData();
    } catch (err) {
      toast.error("Failed to update order status");
    } finally {
      setProcessingActions(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleRequestPayment = async (orderId) => {
    setProcessingActions(prev => ({ ...prev, [`payment-${orderId}`]: true }));
    try {
      await vendorService.requestPayment(orderId);
      toast.success("Payment request sent to admin");
      loadData();
    } catch (err) {
      toast.error("Failed to send payment request");
    } finally {
      setProcessingActions(prev => ({ ...prev, [`payment-${orderId}`]: false }));
    }
  };

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

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-4">
        <Error
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">
            Vendor Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your products and orders
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={loadData}
        >
          <ApperIcon name="RefreshCw" size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold gradient-text">
                {orders.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Package" size={24} className="text-primary-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Products</p>
              <p className="text-2xl font-bold gradient-text">
                {products.filter(p => p.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="ShoppingBasket" size={24} className="text-accent-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold gradient-text">
                {orders.filter(o => o.status === "payment_verified").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Clock" size={24} className="text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold gradient-text">
                RS 45,000
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="DollarSign" size={24} className="text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 p-1 rounded-lg w-fit">
        {[
          { id: "orders", label: "Orders", count: orders.length },
          { id: "products", label: "Products", count: products.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-primary-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Empty
              title="No orders assigned"
              message="Orders will appear here when customers purchase your products."
              icon="Package"
            />
          ) : (
            orders.map((order) => (
              <Card key={order.Id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        Order #{order.Id.toString().padStart(6, "0")}
                      </h3>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {format(new Date(order.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold gradient-text">
                      RS {order.total.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.items.length} items
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-surface-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Name</p>
                      <p className="font-medium">{order.deliveryAddress.fullName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-medium">{order.deliveryAddress.phone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-gray-600">Address</p>
                      <p className="font-medium">
                        {order.deliveryAddress.address}, {order.deliveryAddress.city}
                      </p>
                    </div>
                  </div>
                </div>

{/* Order Items with Availability */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-surface-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={item.available !== false ? "success" : "error"} size="sm">
                                {item.available !== false ? "Available" : "Out of Stock"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">RS {item.price.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Cost: RS {item.costPrice?.toLocaleString() || "N/A"}</p>
                          {order.status === "payment_verified" && (
                            <div className="flex gap-1 mt-2">
                              <Button
                                size="sm"
                                variant={item.available !== false ? "success" : "outline"}
                                onClick={() => handleConfirmAvailability(order.Id, index, true)}
                                disabled={processingActions[`${order.Id}-${index}`]}
                              >
                                <ApperIcon name="Check" size={12} className="mr-1" />
                                Available
                              </Button>
                              <Button
                                size="sm"
                                variant={item.available === false ? "error" : "outline"}
                                onClick={() => handleConfirmAvailability(order.Id, index, false)}
                                disabled={processingActions[`${order.Id}-${index}`]}
                              >
                                <ApperIcon name="X" size={12} className="mr-1" />
                                Out
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

{/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {order.status === "payment_verified" && order.items.every(item => item.available !== false) && (
                    <Button
                      onClick={() => handleMarkAsPacked(order.Id)}
                      size="sm"
                      disabled={processingActions[order.Id]}
                    >
                      <ApperIcon name="Package" size={16} className="mr-2" />
                      {processingActions[order.Id] ? "Processing..." : "Pack & Assign Delivery"}
                    </Button>
                  )}
                  {order.status === "packed" && (
                    <Button
                      onClick={() => handleUpdateOrderStatus(order.Id, "shipped")}
                      variant="accent"
                      size="sm"
                      disabled={processingActions[order.Id]}
                    >
                      <ApperIcon name="Truck" size={16} className="mr-2" />
                      {processingActions[order.Id] ? "Processing..." : "Mark as Shipped"}
                    </Button>
                  )}
                  {(order.status === "delivered" || order.status === "shipped") && !order.paymentRequested && (
                    <Button
                      onClick={() => handleRequestPayment(order.Id)}
                      variant="primary"
                      size="sm"
                      disabled={processingActions[`payment-${order.Id}`]}
                    >
                      <ApperIcon name="DollarSign" size={16} className="mr-2" />
                      {processingActions[`payment-${order.Id}`] ? "Sending..." : "Request Payment"}
                    </Button>
                  )}
                  {order.paymentRequested && (
                    <Badge variant="warning" size="sm">
                      <ApperIcon name="Clock" size={12} className="mr-1" />
                      Payment Requested
                    </Badge>
                  )}
                  <Button variant="outline" size="sm">
                    <ApperIcon name="Eye" size={16} className="mr-2" />
                    View Details
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="space-y-4">
          {products.length === 0 ? (
            <Empty
              title="No products found"
              message="Start by adding your first product to the marketplace."
              icon="ShoppingBasket"
              actionLabel="Add Product"
              onAction={() => console.log("Add product")}
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.Id} className="p-4">
                  <div className="relative mb-3">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={product.isActive ? "success" : "default"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold gradient-text">
                        RS {product.price.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Cost: RS {product.costPrice?.toLocaleString() || "N/A"}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Stock: {product.stock}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <ApperIcon name="Edit" size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant={product.isActive ? "ghost" : "primary"}
                      size="sm"
                      className="flex-1"
                    >
                      <ApperIcon 
                        name={product.isActive ? "EyeOff" : "Eye"} 
                        size={14} 
                        className="mr-1" 
                      />
                      {product.isActive ? "Hide" : "Show"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
)}

      {/* Delivery Personnel Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Assign Delivery Personnel
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeliveryModal(false)}
                >
                  <ApperIcon name="X" size={20} />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver Name *
                  </label>
                  <Input
                    value={deliveryPersonnel.name}
                    onChange={(e) => setDeliveryPersonnel(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter driver name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <Input
                    value={deliveryPersonnel.phone}
                    onChange={(e) => setDeliveryPersonnel(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    type="tel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Number
                  </label>
                  <Input
                    value={deliveryPersonnel.vehicleNumber}
                    onChange={(e) => setDeliveryPersonnel(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                    placeholder="Enter vehicle number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Delivery Time
                  </label>
                  <Input
                    value={deliveryPersonnel.estimatedTime}
                    onChange={(e) => setDeliveryPersonnel(prev => ({ ...prev, estimatedTime: e.target.value }))}
                    placeholder="e.g., 2-3 hours"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowDeliveryModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitDeliveryDetails}
                  disabled={processingActions[selectedOrderId]}
                  className="flex-1"
                >
                  <ApperIcon name="Truck" size={16} className="mr-2" />
                  {processingActions[selectedOrderId] ? "Assigning..." : "Assign & Pack"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;