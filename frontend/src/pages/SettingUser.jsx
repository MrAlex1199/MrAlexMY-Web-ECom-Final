import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiUser, FiMapPin, FiMail, FiLock, FiAlertTriangle, FiX, FiEye, FiEyeOff } from "react-icons/fi";
import { API_BASE_URL } from "../config/api";

export default function Setting({ userData }) {
  const navigate = useNavigate();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      alert("กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่");
      return;
    }
    if (newPassword.length < 8) {
      alert("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert("เปลี่ยนรหัสผ่านสำเร็จ");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        alert(data.message || "เปลี่ยนรหัสผ่านล้มเหลว");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (!newEmail || !emailPassword) {
      alert("กรุณากรอกอีเมลใหม่และรหัสผ่านปัจจุบัน");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/change-email`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail, password: emailPassword }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert("เปลี่ยนอีเมลสำเร็จ");
        setNewEmail("");
        setEmailPassword("");
        setShowEmailForm(false);
        window.location.reload();
      } else {
        alert(data.message || "เปลี่ยนอีเมลล้มเหลว");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการเปลี่ยนอีเมล");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!userData.email) {
      alert("ไม่พบข้อมูลอีเมล");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData.email }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        if (data.resetToken) {
          console.log("Reset token:", data.resetToken);
        }
      } else {
        alert(data.message || "เกิดข้อผิดพลาดในการส่งลิงก์รีเซ็ตรหัสผ่าน");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการส่งลิงก์รีเซ็ตรหัสผ่าน");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      alert("กรุณากรอกรหัสผ่านเพื่อยืนยันการลบบัญชี");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/delete-account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert("ลบบัญชีสำเร็จ");
        localStorage.removeItem("token");
        localStorage.removeItem("isAdmin");
        navigate("/");
      } else {
        alert(data.message || "ลบบัญชีล้มเหลว");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการลบบัญชี");
    } finally {
      setIsLoading(false);
      setShowConfirmPopup(false);
      setDeletePassword("");
    }
  };

  return (
    <div className="page-container py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 pb-6 border-b border-gray-200">
          Account Settings
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8">
          {/* Settings Sidebar Nav */}
          <div className="md:col-span-3 space-y-2">
            <NavLink
              to="/SettingUser"
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm bg-brand-50 text-brand-600 border border-brand-200 shadow-sm"
            >
              <FiUser className="w-4 h-4" /> Account
            </NavLink>
            <NavLink
              to="/ShippingLocations"
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <FiMapPin className="w-4 h-4" /> Shipping Addresses
            </NavLink>
          </div>

          {/* Main Form Content */}
          <div className="md:col-span-9 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Profile & Security</h2>
              <p className="text-xs text-gray-500 mt-1">Manage your email address, password, and account settings</p>
            </div>

            {/* Email Section */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <FiMail className="text-brand-500" /> Email Address
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Your active email is <strong>{userData.email}</strong>
                  </p>
                </div>
                <button 
                  onClick={() => setShowEmailForm(!showEmailForm)}
                  className="btn-ghost text-xs !py-2 !px-4 text-brand-500 font-bold border border-gray-200 rounded-xl"
                >
                  {showEmailForm ? "Cancel" : "Change Email"}
                </button>
              </div>

              {showEmailForm && (
                <form onSubmit={handleChangeEmail} className="mt-4 p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        New Email Address
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="input-field text-sm !py-2.5"
                        placeholder="new@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={emailPassword}
                        onChange={(e) => setEmailPassword(e.target.value)}
                        className="input-field text-sm !py-2.5"
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEmailForm(false)}
                      className="btn-ghost text-xs !py-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary text-xs !py-2 !px-5"
                    >
                      {isLoading ? "Saving..." : "Save Email"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Password Section */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                <FiLock className="text-brand-500" /> Change Password
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="input-field text-sm !py-2.5 !pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      New Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field text-sm !py-2.5"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                    className="text-xs text-brand-500 font-semibold hover:underline"
                  >
                    Forgot password? Recover account
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary text-xs !py-2.5 !px-6 w-full sm:w-auto"
                  >
                    {isLoading ? "Saving..." : "Save Password"}
                  </button>
                </div>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-rose-100">
              <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                  <FiAlertTriangle className="w-5 h-5" /> Delete Account
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Once deleted, your account data will be permanently wiped. This action cannot be undone.
                </p>
                <button
                  type="button"
                  onClick={() => setShowConfirmPopup(true)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
                >
                  Proceed with account deletion
                </button>
              </div>

              {/* Confirm deletion modal */}
              {showConfirmPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
                    <button
                      onClick={() => setShowConfirmPopup(false)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                      <FiAlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        คุณแน่ใจหรือไม่ที่จะลบบัญชีของคุณ?
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        กรอกรหัสผ่านของคุณด้านล่างเพื่อยืนยันการลบบัญชี
                      </p>
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="input-field text-sm !py-2.5 mb-4"
                        placeholder="Enter your password"
                        required
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowConfirmPopup(false)}
                          className="btn-ghost flex-1 text-xs !py-2.5"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={isLoading || !deletePassword}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex-1 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? "Deleting..." : "Delete Account"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
