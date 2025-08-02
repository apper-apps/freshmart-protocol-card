import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { vendorService } from "@/services/api/vendorService";
import { format } from "date-fns";

const VendorDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");

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

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await vendorService.updateOrderStatus(orderId, status);
      loadData(); // Refresh data
    } catch (err) {
      setError("Failed to update order status.");
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

                {/* Order Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-surface-200 last:border-0">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">RS {item.price.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Cost: RS {item.costPrice?.toLocaleString() || "N/A"}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {order.status === "payment_verified" && (
                    <Button
                      onClick={() => handleUpdateOrderStatus(order.Id, "packed")}
                      size="sm"
                    >
                      <ApperIcon name="Package" size={16} className="mr-2" />
                      Mark as Packed
                    </Button>
                  )}
                  {order.status === "packed" && (
                    <Button
                      onClick={() => handleUpdateOrderStatus(order.Id, "shipped")}
                      variant="accent"
                      size="sm"
                    >
                      <ApperIcon name="Truck" size={16} className="mr-2" />
                      Mark as Shipped
                    </Button>
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
    </div>
  );
};

export default VendorDashboard;