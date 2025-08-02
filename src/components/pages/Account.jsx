import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const Account = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  const menuItems = [
    { id: "profile", label: "Profile", icon: "User" },
    { id: "addresses", label: "Addresses", icon: "MapPin" },
    { id: "payments", label: "Payment Methods", icon: "CreditCard" },
    { id: "notifications", label: "Notifications", icon: "Bell" },
    { id: "help", label: "Help & Support", icon: "HelpCircle" },
  ];

  const quickActions = [
    {
      title: "Recent Orders",
      description: "View your order history",
      icon: "Package",
      action: () => navigate("/orders"),
      badge: "3 recent"
    },
    {
      title: "Track Orders",
      description: "Track your current orders",
      icon: "Truck",
      action: () => navigate("/orders"),
      badge: "2 active"
    },
    {
      title: "Vendor Dashboard",
      description: "Manage your vendor account",
      icon: "Store",
      action: () => navigate("/vendor"),
      badge: "New"
    },
    {
      title: "Admin Panel",
      description: "Access admin features",
      icon: "Settings",
      action: () => navigate("/admin"),
      badge: "Admin"
    }
  ];

  const recentActivity = [
    {
      title: "Order #000123 delivered",
      description: "Fresh vegetables and fruits",
      time: "2 hours ago",
      icon: "CheckCircle",
      color: "text-green-600"
    },
    {
      title: "Payment verified",
      description: "Order #000122 payment confirmed",
      time: "1 day ago",
      icon: "CreditCard",
      color: "text-blue-600"
    },
    {
      title: "New address added",
      description: "Home address updated",
      time: "3 days ago",
      icon: "MapPin",
      color: "text-primary-600"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ApperIcon name="User" size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
          Welcome Back!
        </h1>
        <p className="text-gray-600">
          Manage your account and preferences
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              hover
              onClick={action.action}
              className="p-4 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <ApperIcon name={action.icon} size={20} className="text-primary-600" />
                </div>
                {action.badge && (
                  <Badge variant="primary" size="sm">
                    {action.badge}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600">
                {action.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Menu */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Account Settings
            </h3>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                    activeTab === item.id
                      ? "bg-primary-50 text-primary-700 border border-primary-200"
                      : "text-gray-600 hover:bg-surface-50 hover:text-gray-900"
                  }`}
                >
                  <ApperIcon name={item.icon} size={18} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Profile Information
              </h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="p-3 bg-surface-50 rounded-lg">
                      <p className="text-gray-900">John Doe</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="p-3 bg-surface-50 rounded-lg">
                      <p className="text-gray-900">john@example.com</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="p-3 bg-surface-50 rounded-lg">
                    <p className="text-gray-900">+92 300 1234567</p>
                  </div>
                </div>
                <Button>
                  <ApperIcon name="Edit" size={16} className="mr-2" />
                  Edit Profile
                </Button>
              </div>
            </Card>
          )}

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center ${activity.color}`}>
                    <ApperIcon name={activity.icon} size={16} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {activity.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* App Info */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              About FreshMart Hub
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-surface-200">
                <span className="text-gray-600">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-surface-200">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium">Dec 2024</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Support</span>
                <Button variant="ghost" size="sm">
                  <ApperIcon name="ExternalLink" size={14} className="mr-1" />
                  Contact
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Account;