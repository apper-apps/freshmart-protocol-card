import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "@/index.css";
import Layout from "@/components/organisms/Layout";
import DeliveryApp from "@/components/pages/DeliveryApp";
import OrderDetail from "@/components/pages/OrderDetail";
import VendorDashboard from "@/components/pages/VendorDashboard";
import Orders from "@/components/pages/Orders";
import Account from "@/components/pages/Account";
import Checkout from "@/components/pages/Checkout";
import Home from "@/components/pages/Home";
import Categories from "@/components/pages/Categories";
import ProductDetail from "@/components/pages/ProductDetail";
import Cart from "@/components/pages/Cart";
import AdminDashboard from "@/components/pages/AdminDashboard";
import POSCheckout from "@/components/pages/POSCheckout";

function App() {
return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface-200">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="categories" element={<Categories />} />
            <Route path="categories/:categoryId" element={<Categories />} />
            <Route path="product/:productId" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderId" element={<OrderDetail />} />
            <Route path="account" element={<Account />} />
            <Route path="vendor" element={<VendorDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="pos" element={<POSCheckout />} />
            <Route path="delivery" element={<DeliveryApp />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        
<Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              zIndex: 9999,
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;