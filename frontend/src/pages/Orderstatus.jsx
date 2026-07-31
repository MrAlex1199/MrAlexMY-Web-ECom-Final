import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiRotateCcw, FiClock } from "react-icons/fi";
import { API_BASE_URL } from "../config/api";

export default function Orderstatus({ userId }) {
  const [filter, setFilter] = useState("In Transit");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found, user not authenticated");
          setOrders([]);
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/orders/${userId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log("User not authenticated");
            setOrders([]);
            setLoading(false);
            return;
          }
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders || []);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const filteredOrders = orders.filter((order) => {
    if (filter === "All") return true;
    return order.status === filter;
  });

  const formatAddress = (addr) => {
      if (!addr) return "No address provided";
      return `${addr.address}, ${addr.city}, ${addr.postalCode}, ${addr.country}`;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "Shipped":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"><FiCheckCircle /> Shipped</span>;
      case "In Transit":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"><FiTruck /> In Transit</span>;
      case "Returned":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700"><FiRotateCcw /> Returned</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700"><FiXCircle /> {status}</span>;
    }
  };

  const filterTabs = [
    { label: "In Transit", icon: FiTruck },
    { label: "Shipped", icon: FiCheckCircle },
    { label: "Cancelled", icon: FiXCircle },
    { label: "Returned", icon: FiRotateCcw },
    { label: "All", icon: FiPackage }
  ];

  return (
    <div className="page-container py-10">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-8 px-4">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Order Status
        </h1>
        <p className="mt-2 text-base text-gray-500">
          Track your orders in real-time
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="max-w-4xl mx-auto mb-10 px-4">
        <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-gray-200/60 backdrop-blur-sm rounded-2xl max-w-fit mx-auto">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = filter === (tab.label === "All" ? "All" : tab.label);
            return (
              <button
                key={tab.label}
                onClick={() => setFilter(tab.label === "All" ? "All" : tab.label)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6 px-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-gray-900">
                      Order #{order.orderId}
                    </h2>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-4">
                    <span className="flex items-center gap-1"><FiClock /> {new Date(order.createdAt).toLocaleDateString()}</span>
                    <span>Est. Delivery: {new Date(order.estDelivery).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
                  <div className="bg-gray-50/80 rounded-xl p-4 space-y-3 border border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Shipping To</p>
                      <p className="text-gray-800 text-sm font-medium mt-0.5">{formatAddress(order.shippingAddress)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Payment Method</p>
                      <p className="text-gray-800 text-sm font-medium capitalize mt-0.5">{order.payment}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50/80 rounded-xl p-4 md:col-span-2 border border-gray-100 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Purchased Items</p>
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {order.productSelected.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-800 font-medium truncate max-w-[200px]">{item.name}</span>
                            <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                            <span className="text-gray-900 font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-200/60 flex justify-between items-center text-sm">
                      <span className="text-gray-500">Delivery: ${order.deliveryPrice.toFixed(2)}</span>
                      <span className="text-base font-bold text-gray-900">Total: ${order.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Tracking section */}
                <div className="bg-brand-50/40 rounded-xl p-4 border border-brand-100 mb-5 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-gray-400 block text-xs">Tracking Code</span>
                      <span className="font-semibold text-gray-800">{order.trackingCode || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs">Carrier</span>
                      <span className="font-semibold text-gray-800">{order.carrier || "Standard"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs">Last Update Location</span>
                      <span className="font-semibold text-gray-800">{order.lastLocation || "In transit"}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <NavLink
                      to="/products"
                      className="btn-primary text-center text-sm !py-2.5 flex-1"
                    >
                      Buy Again
                    </NavLink>
                    <NavLink
                      to="/contact"
                      className="btn-ghost border border-gray-200 text-center text-sm !py-2.5 flex-1"
                    >
                      Contact Support
                    </NavLink>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No orders found in this status category.</p>
                <Link to="/products" className="btn-primary text-sm mt-4 inline-block">Start Shopping</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
