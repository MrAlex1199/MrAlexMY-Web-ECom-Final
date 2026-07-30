import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiShoppingBag, FiTruck, FiCreditCard, FiAlertCircle } from "react-icons/fi";

export default function CheckoutPage({ userId, selectedProducts = [] }) {
  const [stockErrors, setStockErrors] = useState([]);
  const [showStockModal, setShowStockModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    const productSelected = selectedProducts.map((p) => ({
      productId: p.productId?._id || p.productId,
      quantity: p.quantity || 1,
    }));

    if (!productSelected || productSelected.length === 0) {
      alert("No items in cart to checkout.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/validate-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSelected }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        setStockErrors(data.errors || [{ error: data.message }]);
        setShowStockModal(true);
        setLoading(false);
        return;
      }

      alert("All items are in stock. Proceeding to payment...");
    } catch (err) {
      console.error("Error validating stock:", err);
      alert("Failed to validate stock. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowStockModal(false);
    setStockErrors([]);
  };

  return (
    <div className="page-container py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Step Tracker */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-brand-500">SongTor</span> Hub
          </Link>

          {/* Stepper */}
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
              <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <FiCheck className="w-4 h-4" />
              </span>
              <span>Shop</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200" />
            <div className="flex items-center gap-2 text-brand-500 font-semibold text-sm">
              <span className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs">
                2
              </span>
              <span>Shipping & Payment</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200" />
            <div className="flex items-center gap-2 text-gray-400 font-medium text-sm">
              <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs">
                3
              </span>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Summary & Delivery options */}
          <div className="lg:col-span-7 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FiShoppingBag className="text-brand-500" /> Order Summary
              </h2>
              <p className="text-sm text-gray-500 mb-6">Review your items before proceeding</p>

              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {selectedProducts.map((item, idx) => {
                  const prod = item.productId || {};
                  const price = prod.discount > 0 ? prod.price * (1 - prod.discount / 100) : prod.price || 0;
                  return (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <img
                        className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                        src={prod.imageSrc || "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519"}
                        alt={prod.name}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{prod.name || "Product Item"}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                      </div>
                      <p className="text-base font-bold text-gray-900">${(price * (item.quantity || 1)).toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping options */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiTruck className="text-brand-500" /> Shipping Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-brand-500 bg-brand-50/30 cursor-pointer">
                  <input type="radio" name="shipping" defaultChecked className="text-brand-500 focus:ring-brand-500" />
                  <div>
                    <span className="font-semibold text-gray-900 text-sm block">Express Delivery</span>
                    <span className="text-xs text-gray-500">2-4 Business Days ($8.00)</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-gray-200 cursor-pointer">
                  <input type="radio" name="shipping" className="text-brand-500 focus:ring-brand-500" />
                  <div>
                    <span className="font-semibold text-gray-900 text-sm block">Standard Delivery</span>
                    <span className="text-xs text-gray-500">5-7 Business Days (Free)</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Payment Form */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <FiCreditCard className="text-brand-500" /> Payment Details
              </h2>
              <p className="text-sm text-gray-500 mb-6">Complete your checkout safely</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="input-field text-sm !py-2.5"
                    placeholder="your.email@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Card Holder Name
                  </label>
                  <input
                    type="text"
                    className="input-field text-sm !py-2.5 uppercase"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    className="input-field text-sm !py-2.5"
                    placeholder="4532 •••• •••• 8892"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Expiry
                    </label>
                    <input
                      type="text"
                      className="input-field text-sm !py-2.5"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      className="input-field text-sm !py-2.5"
                      placeholder="123"
                    />
                  </div>
                </div>

                {/* Subtotal */}
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span>$8.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-brand-500">Calculated at Checkout</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="btn-primary w-full !py-3.5 mt-4 text-base font-semibold shadow-lg shadow-brand-500/20"
                >
                  {loading ? "Validating stock..." : "Place Order Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Error Modal */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <FiAlertCircle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-lg font-bold">สินค้าบางรายการหมดหรือจำนวนไม่พอ</h3>
            </div>
            <div className="space-y-3 max-h-64 overflow-auto mb-6 pr-1">
              {stockErrors.map((err, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-red-50 border border-red-100">
                  <p className="font-semibold text-sm text-gray-900">{err.productName || err.productId || 'สินค้าบางรายการ'}</p>
                  <p className="text-xs text-gray-600 mt-0.5">Requested: {err.requested ?? '-'} | Available: {err.available ?? '-'}</p>
                  <p className="text-xs text-red-600 font-medium mt-1">{err.error}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={closeModal} className="btn-ghost flex-1 text-sm !py-2.5">ปิด</button>
              <button onClick={() => { closeModal(); window.location.href = '/cart'; }} className="btn-primary flex-1 text-sm !py-2.5">
                ไปที่ตะกร้าสินค้า
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
