import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiAlertTriangle } from "react-icons/fi";
import { API_BASE_URL } from "../config/api";

export default function Cart({ userId, userData, selectedProducts, setSelectedProducts }) {
  const [shippingAddressId, setShippingAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [stockLevels, setStockLevels] = useState({});

  useEffect(() => {
    const calculateTotal = () => {
      if (!selectedProducts || selectedProducts.length === 0) return 0;
      return selectedProducts.reduce((acc, item) => {
        if (!item.productId || !item.productId.price) return acc;
        const price = item.productId.discount > 0
          ? item.productId.price * (1 - item.productId.discount / 100)
          : item.productId.price;
        return acc + price * item.quantity;
      }, 0);
    };
    setTotalPrice(calculateTotal());
  }, [selectedProducts]);

  useEffect(() => {
    const fetchStockLevels = async () => {
      if (!selectedProducts || selectedProducts.length === 0) return;
      const productIds = selectedProducts.map(item => item.productId._id);
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/stock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds }),
        });
        if (!response.ok) throw new Error("Failed to fetch stock levels");
        const data = await response.json();
        if (data.success) setStockLevels(data.stockLevels);
      } catch (error) {
        console.error("Error fetching stock levels:", error);
      }
    };
    fetchStockLevels();
  }, [selectedProducts]);

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      if (!userId) throw new Error("User ID is missing");
      const token = localStorage.getItem("token");
      if (!token) { alert("กรุณาเข้าสู่ระบบเพื่อจัดการตะกร้าสินค้า"); return; }
      const url = newQuantity <= 0
        ? `${API_BASE_URL}/api/cart/delete-product/${userId}/${productId}`
        : `${API_BASE_URL}/api/cart/update-quantity/${userId}/${productId}`;
      const response = await fetch(url, {
        method: newQuantity <= 0 ? "DELETE" : "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: newQuantity > 0 ? JSON.stringify({ quantity: newQuantity }) : undefined,
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) { alert("กรุณาเข้าสู่ระบบใหม่"); return; }
        throw new Error(errorData.message || "Failed to update cart");
      }
      const data = await response.json();
      if (data.success) setSelectedProducts(data.selectedProducts);
    } catch (error) {
      console.error("Failed to update product quantity:", error);
      alert("เกิดข้อผิดพลาดในการอัปเดตจำนวนสินค้า");
    }
  };

  const getDeliveryPrice = () => {
    if (!shippingAddressId) return 0;
    const selectedAddr = userData.address.find(addr => addr._id === shippingAddressId);
    if (!selectedAddr) return 0;
    switch (selectedAddr.country?.toLowerCase()) {
      case 'united states': return 5;
      case 'europe': return 10;
      case 'asia': return 15;
      default: return 20;
    }
  };

  const deliveryPrice = getDeliveryPrice();
  const finalTotalPrice = totalPrice + deliveryPrice;
  const isCartInvalid = selectedProducts.some(item => item.quantity > stockLevels[item.productId._id]);

  const saveOrderDetails = async () => {
    try {
      if (isCartInvalid) { alert("Cannot proceed to checkout due to insufficient stock. Please adjust quantities."); return; }
      if (!userId || !shippingAddressId || !paymentMethod) { alert("Please select shipping address and payment method."); return; }
      const shippingAddress = userData.address.find(addr => addr._id === shippingAddressId);
      if (!shippingAddress) { alert("Selected shipping address not found."); return; }

      const orderDetails = {
        userId,
        productSelected: selectedProducts.map(item => ({ productId: item.productId._id, quantity: item.quantity })),
        shippingAddress: {
          firstName: shippingAddress.firstName, lastName: shippingAddress.lastName,
          city: shippingAddress.city, postalCode: shippingAddress.postalCode,
          country: shippingAddress.country, address: shippingAddress.address, phone: shippingAddress.phone,
        },
        payment: paymentMethod,
        deliveryPrice,
      };
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/orders/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(orderDetails),
      });
      if (!response.ok) throw new Error("Failed to save order details");
      await fetch(`${API_BASE_URL}/api/cart/clear/${userId}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      setSelectedProducts([]);
      window.location.href = "/Orderstatus";
    } catch (error) {
      console.error("Error saving order details:", error);
    }
  };

  const getOptionName = (item, optionType) => {
    const optionValue = optionType === 'color' ? item.selectedColor : item.selectedSize;
    const optionsArray = optionType === 'color' ? item.productId?.colors : item.productId?.sizes;
    if (!optionsArray) return optionValue;
    const foundById = optionsArray.find(opt => opt._id === optionValue);
    if (foundById) return foundById.name;
    return optionValue;
  };

  // Empty cart state
  if (!selectedProducts || selectedProducts.length === 0) {
    return (
      <div className="page-container">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <FiShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added any items yet.</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            Start Shopping <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-500 mt-1">{selectedProducts.length} {selectedProducts.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart items */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Table header (desktop) */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-5">Product</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-4 text-right">Total</div>
              </div>

              {/* Items */}
              {selectedProducts.map((item) => {
                if (!item.productId) return null;
                const price = item.productId.discount > 0 ? item.productId.price * (1 - item.productId.discount / 100) : item.productId.price;
                const itemTotalPrice = price * item.quantity;
                const colorName = getOptionName(item, 'color');
                const sizeName = getOptionName(item, 'size');
                const availableStock = stockLevels[item.productId._id];
                const isOutOfStock = availableStock !== undefined && item.quantity > availableStock;
                let stockMessage = '';
                if (availableStock !== undefined) {
                  if (availableStock <= 0) stockMessage = "Out of stock";
                  else if (item.quantity > availableStock) stockMessage = `Only ${availableStock} left`;
                }

                return (
                  <div key={item.productId._id + item.selectedColor + item.selectedSize} className="px-6 py-5 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Product info */}
                      <div className="col-span-12 md:col-span-5 flex items-center gap-4">
                        <img src={item.productId.imageSrc} alt={item.productId.name}
                          className="w-20 h-20 object-cover rounded-xl border border-gray-100 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{item.productId.name}</h3>
                          <p className="text-sm font-medium text-brand-500 mt-0.5">${price.toFixed(2)}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Color: {colorName} · Size: {sizeName}</p>
                        </div>
                      </div>

                      {/* Quantity controls */}
                      <div className="col-span-6 md:col-span-3">
                        <div className="flex items-center justify-center">
                          <button onClick={() => handleQuantityChange(item.productId._id, item.quantity - 1)}
                            className="w-9 h-9 flex items-center justify-center rounded-l-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
                            <FiMinus className="w-3.5 h-3.5" />
                          </button>
                          <input type="text" value={item.quantity} readOnly
                            className="w-12 h-9 text-center border-y border-gray-200 text-sm font-medium text-gray-900 focus:outline-none" />
                          <button onClick={() => handleQuantityChange(item.productId._id, item.quantity + 1)}
                            className="w-9 h-9 flex items-center justify-center rounded-r-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
                            <FiPlus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {isOutOfStock && (
                          <p className="text-red-500 text-xs text-center mt-1.5 flex items-center justify-center gap-1">
                            <FiAlertTriangle className="w-3 h-3" /> {stockMessage}
                          </p>
                        )}
                      </div>

                      {/* Item total */}
                      <div className="col-span-6 md:col-span-4">
                        <p className="text-base font-bold text-gray-900 text-right">${itemTotalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue shopping link */}
            <div className="mt-4">
              <Link to="/products" className="text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors inline-flex items-center gap-1">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Shipping address */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Shipping Address</label>
                  <select value={shippingAddressId} onChange={(e) => setShippingAddressId(e.target.value)}
                    className="input-field text-sm !py-2.5">
                    <option value="">Select an address</option>
                    {userData.address && userData.address.map((addr) => (
                      <option key={addr._id} value={addr._id}>{`${addr.firstName} ${addr.lastName}, ${addr.address}, ${addr.city}`}</option>
                    ))}
                  </select>
                  {userData.address && userData.address.length === 0 && (
                    <Link to="/ShippingLocations" className="text-xs text-brand-500 hover:underline mt-1 inline-block">
                      + Add shipping address
                    </Link>
                  )}
                </div>

                {/* Payment */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Payment Method</label>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'credit' ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-gray-200'}`}>
                      <input type="radio" value="credit" checked={paymentMethod === "credit"} onChange={(e) => setPaymentMethod(e.target.value)} className="text-brand-500 focus:ring-brand-500" />
                      <span className="text-sm font-medium text-gray-700">💳 Credit Card</span>
                    </label>
                    <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'paypal' ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-gray-200'}`}>
                      <input type="radio" value="paypal" checked={paymentMethod === "paypal"} onChange={(e) => setPaymentMethod(e.target.value)} className="text-brand-500 focus:ring-brand-500" />
                      <span className="text-sm font-medium text-gray-700">🅿️ PayPal</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium text-gray-900">{deliveryPrice > 0 ? `$${deliveryPrice.toFixed(2)}` : '—'}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-100">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-brand-500">${finalTotalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout button */}
              <button onClick={saveOrderDetails}
                disabled={!shippingAddressId || !paymentMethod || selectedProducts.length === 0 || isCartInvalid}
                className="btn-primary w-full mt-6 !py-3.5 text-base gap-2">
                Proceed to Checkout <FiArrowRight className="w-4 h-4" />
              </button>

              {isCartInvalid && (
                <p className="text-red-500 text-xs text-center mt-3 flex items-center justify-center gap-1">
                  <FiAlertTriangle className="w-3 h-3" /> Please resolve stock issues before proceeding.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
