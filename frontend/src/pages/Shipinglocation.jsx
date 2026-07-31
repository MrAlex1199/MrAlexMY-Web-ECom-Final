import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiUser, FiMapPin, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { API_BASE_URL } from "../config/api";

export default function ShippingLocations({ userData, userId }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [age] = useState("");

  const handleSaveAddress = async () => {
    if (!firstName || !lastName || !city || !postalCode || !country || !address) {
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("กรุณาเข้าสู่ระบบเพื่อบันทึกที่อยู่");
        return;
      }

      const addressPayload = {
        userId,
        firstName,
        lastName,
        city,
        postalCode,
        country,
        address,
        phone: phone || "",
      };
      if (age) addressPayload.age = Number(age);

      const response = await fetch(`${API_BASE_URL}/api/users/save-address`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(addressPayload),
      });

      if (response.ok) {
        alert("บันทึกที่อยู่สำเร็จ");
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert("บันทึกที่อยู่ล้มเหลว: " + (errorData.message || ""));
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการบันทึกที่อยู่");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบที่อยู่นี้?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("กรุณาเข้าสู่ระบบเพื่อลบที่อยู่");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/users/delete-address/${userId}/${addressId}`, {
          method: "DELETE",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });

        if (response.ok) {
          alert("ลบที่อยู่สำเร็จ");
          window.location.reload();
        } else {
          const errorData = await response.json();
          alert("ลบที่อยู่ล้มเหลว: " + (errorData.message || ""));
        }
      } catch (error) {
        console.error(error);
        alert("เกิดข้อผิดพลาดในการลบที่อยู่");
      }
    }
  };

  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editPostalCode, setEditPostalCode] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAge, setEditAge] = useState("");

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setEditFirstName(addr.firstName || "");
    setEditLastName(addr.lastName || "");
    setEditCity(addr.city || "");
    setEditPostalCode(addr.postalCode || "");
    setEditCountry(addr.country || "");
    setEditAddress(addr.address || "");
    setEditPhone(addr.phone || "");
    setEditAge(addr.age || "");
  };

  const handleSaveEditAddress = async () => {
    if (!editFirstName || !editLastName || !editCity || !editPostalCode || !editCountry || !editAddress) {
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("กรุณาเข้าสู่ระบบเพื่อแก้ไขที่อยู่");
        return;
      }

      const editPayload = {
        firstName: editFirstName,
        lastName: editLastName,
        city: editCity,
        postalCode: editPostalCode,
        country: editCountry,
        address: editAddress,
        phone: editPhone || "",
      };
      if (editAge) editPayload.age = Number(editAge);

      const response = await fetch(`${API_BASE_URL}/api/users/update-address/${userId}/${editingAddressId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editPayload),
      });
      if (response.ok) {
        alert("อัปเดตที่อยู่สำเร็จ");
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert("อัปเดตที่อยู่ล้มเหลว: " + (errorData.message || ""));
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการอัปเดตที่อยู่");
    }
  };

  return (
    <div className="page-container py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 pb-6 border-b border-gray-200">
          Account Settings
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8">
          {/* Sidebar */}
          <div className="md:col-span-3 space-y-2">
            <NavLink
              to="/SettingUser"
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <FiUser className="w-4 h-4" /> Account
            </NavLink>
            <NavLink
              to="/ShippingLocations"
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm bg-brand-50 text-brand-600 border border-brand-200 shadow-sm"
            >
              <FiMapPin className="w-4 h-4" /> Shipping Addresses
            </NavLink>
          </div>

          {/* Main */}
          <div className="md:col-span-9 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Shipping Addresses</h2>
              <p className="text-xs text-gray-500 mt-1">Manage delivery locations for faster checkout</p>
            </div>

            {/* List */}
            <div className="space-y-4">
              {userData.address && userData.address.length > 0 ? (
                userData.address.map((addr) => (
                  <div key={addr._id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    {editingAddressId !== addr._id ? (
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{addr.firstName} {addr.lastName}</p>
                          <p className="text-xs text-gray-600 mt-1">{addr.address}, {addr.city} {addr.postalCode}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{addr.country} · {addr.phone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditAddress(addr)}
                            className="btn-ghost text-xs !py-1.5 !px-3 inline-flex items-center gap-1.5 border border-gray-200"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Edit Form */
                      <div className="space-y-4 pt-2">
                        <h4 className="font-bold text-sm text-gray-900">Edit Address</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input type="text" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} placeholder="First Name" className="input-field text-xs !py-2" />
                          <input type="text" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} placeholder="Last Name" className="input-field text-xs !py-2" />
                          <input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)} placeholder="City" className="input-field text-xs !py-2" />
                          <input type="text" value={editPostalCode} onChange={(e) => setEditPostalCode(e.target.value)} placeholder="Postal Code" className="input-field text-xs !py-2" />
                          <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone" className="input-field text-xs !py-2" />
                          <input type="text" value={editCountry} onChange={(e) => setEditCountry(e.target.value)} placeholder="Country" className="input-field text-xs !py-2" />
                          <input type="text" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Full Address" className="input-field text-xs !py-2 sm:col-span-2" />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button onClick={() => setEditingAddressId(null)} className="btn-ghost text-xs !py-1.5">Cancel</button>
                          <button onClick={handleSaveEditAddress} className="btn-primary text-xs !py-1.5 !px-4">Save</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <FiMapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No shipping addresses saved yet.</p>
                </div>
              )}
            </div>

            {/* Add New Form */}
            {editingAddressId === null && (
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <FiPlus className="text-brand-500" /> Add New Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name *" className="input-field text-sm !py-2.5" />
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name *" className="input-field text-sm !py-2.5" />
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City *" className="input-field text-sm !py-2.5" />
                  <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Postal Code *" className="input-field text-sm !py-2.5" />
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="input-field text-sm !py-2.5" />
                  <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country *" className="input-field text-sm !py-2.5" />
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full Address *" className="input-field text-sm !py-2.5 sm:col-span-2" />
                </div>
                <div className="flex justify-end pt-4">
                  <button onClick={handleSaveAddress} className="btn-primary text-sm !py-2.5 !px-6">
                    Save Address
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
