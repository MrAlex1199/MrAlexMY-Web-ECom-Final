import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../components/logo/weblogo.jpg";
import apiService from "../services/api";
import { FiMail, FiLock, FiUser } from "react-icons/fi";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !fname || !lname) {
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    setLoading(true);
    try {
      await apiService.register({ email, password, fname, lname });
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      alert(error.message || "Registration failed");
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
            Create an Account
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Join SongTor Hub to buy & sell securely
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                First Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                  className="input-field text-sm !pl-10 !py-2.5"
                  placeholder="First"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lname}
                onChange={(e) => setLname(e.target.value)}
                className="input-field text-sm !py-2.5"
                placeholder="Last"
                required
              />
            </div>
          </div>

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
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Password
            </label>
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
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-brand-500 hover:text-brand-600 transition-colors ml-1"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
