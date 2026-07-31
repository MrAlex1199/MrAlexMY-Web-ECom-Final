import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import logo from "../components/logo/weblogo.jpg";
import { FiLock, FiEye, FiEyeOff, FiKey } from "react-icons/fi";
import { API_BASE_URL } from "../config/api";

export default function PasswordReset() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Token ไม่ถูกต้อง กรุณาใช้ลิงก์จากอีเมลที่ได้รับ");
      return;
    }

    if (!newPassword || !confirmPassword) {
      alert("กรุณากรอกรหัสผ่านใหม่และยืนยันรหัสผ่าน");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (newPassword.length < 8) {
      alert("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("รีเซ็ตรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่");
        navigate("/login");
      } else {
        alert(data.message || "รีเซ็ตรหัสผ่านล้มเหลว");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group mb-3">
            <img className="h-10 w-auto rounded-xl shadow-sm" src={logo} alt="SongTor Hub" />
            <span className="text-xl font-bold text-gray-900 group-hover:text-brand-500 transition-colors">
              SongTor Hub
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Reset Password
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Enter your reset token and new password
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleResetPassword}>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Reset Token
            </label>
            <div className="relative">
              <FiKey className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="input-field text-sm !pl-10 !py-2.5"
                placeholder="Enter reset token"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              New Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field text-sm !pl-10 !pr-10 !py-2.5"
                placeholder="At least 8 characters"
                required
              />
              <button
                type="button"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field text-sm !pl-10 !py-2.5"
                placeholder="Repeat new password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full !py-3 text-sm font-semibold mt-2 shadow-lg shadow-brand-500/20"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>

          <div className="text-center pt-4 border-t border-gray-100 mt-6">
            <Link to="/login" className="text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors">
              ← Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}