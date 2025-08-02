import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { adminService } from "@/services/api/adminService";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [pendingOrders, setPendingOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Product form state
  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    costPrice: "",
    stock: "",
    image: "",
    vendorId: "1"
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, ordersData, productsData] = await Promise.all([
        adminService.getStats(),
        adminService.getPendingOrders(),
        adminService.getProducts()
      ]);
      
      setStats(statsData);
      setPendingOrders(ordersData);
      setProducts(productsData);
    } catch (err) {
      setError("Failed to load admin data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await adminService.addProduct({
        ...productForm,
        price: parseFloat(productForm.price),
        costPrice: parseFloat(productForm.costPrice),
        stock: parseInt(productForm.stock)
      });
      
      setProductForm({
        title: "",
        description: "",
        category: "",
        price: "",
        costPrice: "",
        stock: "",
        image: "",
        vendorId: "1"
      });
      setShowAddProduct(false);
      loadData();
    } catch (err) {
      setError("Failed to add product.");
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

  const categories = [
    "Vegetables", "Fruits", "Dairy", "Meat", "Beverages", 
    "Grains", "Snacks", "Household", "Personal Care"
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage products, orders, and vendors
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddProduct(true)}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Plus" size={16} />
            Add Product
          </Button>
          <Button
            variant="ghost"
            onClick={loadData}
          >
            <ApperIcon name="RefreshCw" size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold gradient-text">
                {stats.totalOrders || 0}
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
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold gradient-text">
                {stats.totalProducts || 0}
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
                {stats.pendingOrders || 0}
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
                RS {(stats.totalRevenue || 0).toLocaleString()}
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
          { id: "overview", label: "Overview" },
          { id: "orders", label: "Orders", count: pendingOrders.length },
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
            {tab.label} {tab.count && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Recent Orders
            </h3>
            <div className="space-y-3">
              {pendingOrders.slice(0, 5).map((order) => (
                <div key={order.Id} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                  <div>
                    <p className="font-medium">Order #{order.Id.toString().padStart(6, "0")}</p>
                    <p className="text-sm text-gray-600">{order.deliveryAddress.fullName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold gradient-text">RS {order.total.toLocaleString()}</p>
                    <Badge variant="warning" size="sm">Pending</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Top Products
            </h3>
            <div className="space-y-3">
              {products.slice(0, 5).map((product) => (
                <div key={product.Id} className="flex items-center gap-3 p-3 bg-surface-50 rounded-lg">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{product.title}</p>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold gradient-text">RS {product.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {pendingOrders.map((order) => (
            <Card key={order.Id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Order #{order.Id.toString().padStart(6, "0")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Customer: {order.deliveryAddress.fullName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Phone: {order.deliveryAddress.phone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold gradient-text">
                    RS {order.total.toLocaleString()}
                  </p>
                  <Badge variant="warning">Payment Pending</Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        {item.quantity}x {item.title}
                      </p>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Payment Info</h4>
                  <p className="text-sm text-gray-600">Method: {order.paymentMethod}</p>
                  <p className="text-sm text-gray-600">Transaction: {order.transactionId}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm">
                  <ApperIcon name="Check" size={16} className="mr-2" />
                  Verify Payment
                </Button>
                <Button variant="outline" size="sm">
                  <ApperIcon name="Eye" size={16} className="mr-2" />
                  View Details
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600">
                  <ApperIcon name="X" size={16} className="mr-2" />
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                  <p className="text-xs text-gray-500">
                    Cost: RS {product.costPrice?.toLocaleString() || "N/A"}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Stock: {product.stock}
                </p>
              </div>
              
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  <ApperIcon name="Edit" size={12} className="mr-1" />
                  Edit
                </Button>
                <Button
                  variant={product.isActive ? "ghost" : "primary"}
                  size="sm"
                  className="flex-1 text-xs"
                >
                  <ApperIcon 
                    name={product.isActive ? "EyeOff" : "Eye"} 
                    size={12} 
                    className="mr-1" 
                  />
                  {product.isActive ? "Hide" : "Show"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Add New Product</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowAddProduct(false)}
                >
                  <ApperIcon name="X" size={20} />
                </Button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Product Title *"
                    value={productForm.title}
                    onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                      className="w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    className="w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    label="Selling Price (RS) *"
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    required
                  />
                  <Input
                    label="Cost Price (RS)"
                    type="number"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({...productForm, costPrice: e.target.value})}
                  />
                  <Input
                    label="Stock Quantity *"
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                    required
                  />
                </div>

                <Input
                  label="Image URL *"
                  value={productForm.image}
                  onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  required
                />

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    <ApperIcon name="Plus" size={16} className="mr-2" />
                    Add Product
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddProduct(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;