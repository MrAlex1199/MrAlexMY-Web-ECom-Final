import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../components/logo/weblogo.jpg";
import { FiMail, FiLock, FiX } from "react-icons/fi";

function ForgotPasswordModal() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("กรุณากรอกอีเมล");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        if (data.resetToken) {
          console.log("Reset token (for development):", data.resetToken);
          const resetUrl = `${window.location.origin}/reset-password?token=${data.resetToken}`;
          alert(`Reset URL (for development): ${resetUrl}`);
        }
        setShowModal(false);
        setEmail("");
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

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors"
      >
        ลืมรหัสผ่าน?
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => {
                setShowModal(false);
                setEmail("");
              }}
            >
              <FiX className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              กู้คืนรหัสผ่าน
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  อีเมลของคุณ
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field text-sm !py-2.5"
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEmail("");
                  }}
                  className="btn-ghost text-xs !py-2 !px-4"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary text-xs !py-2 !px-4"
                >
                  {isLoading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ต"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default function Login({ setIsLoggedIn, setUserData }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      alert("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
        setUserData({
          userId: data.userId,
          email: data.email,
          fname: data.fname,
          lname: data.lname,
          address: data.address || [],
        });
        navigate("/");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
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
            Welcome Back!
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Sign in to access your account & orders
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field text-sm !pl-10 !py-2.5"
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <ForgotPasswordModal />
            </div>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field text-sm !pl-10 !py-2.5"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-3 text-sm font-semibold mt-2 shadow-lg shadow-brand-500/20"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-brand-500 hover:text-brand-600 transition-colors ml-1"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
