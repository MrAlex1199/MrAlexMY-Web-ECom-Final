import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../components/logo/weblogo.jpg";
import toast, { Toaster } from "react-hot-toast";
import { API_BASE_URL } from "../../config/api";

export default function AdminRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [masterID, setMasterID] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("Data Entry Clerk");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMasterSetup, setShowMasterSetup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("isAdmin") === "true") {
      navigate("/admindashboard");
    }
    fetchRoles();
    checkMasterAdmin();
  }, [navigate]);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/roles`);
      const data = await response.json();
      if (data.success) {
        setRoles(data.roles);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const checkMasterAdmin = async () => {
    try {
      // Try to create master admin - if it fails, master admin already exists
      const response = await fetch(`${API_BASE_URL}/api/auth/create-master-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await response.json();
      
      if (response.status === 400 && data.message === "Master Admin already exists") {
        // Master admin exists, don't show setup
        setShowMasterSetup(false);
      } else if (response.ok) {
        // No master admin existed, but we just created one
        setShowMasterSetup(false);
        toast.success("Master Admin สร้างสำเร็จ!");
      } else {
        // Some other error, show setup
        setShowMasterSetup(true);
      }
    } catch (error) {
      console.error("Error checking master admin:", error);
      // On network error, show setup
      setShowMasterSetup(true);
    }
  };

  const createMasterAdmin = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/create-master-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Master Admin สร้างสำเร็จ! กรุณาเข้าสู่ระบบด้วย: erogun@admin.com / ErogunMaster123");
        setTimeout(() => navigate("/admin-login"), 3000);
      } else {
        toast.error(data.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("เกิดข้อผิดพลาดในการสร้าง Master Admin");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("AToken");
      const response = await fetch(`${API_BASE_URL}/api/auth/admin-register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          masterID,
          phoneNumber,
          role,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("สร้างแอดมินสำเร็จ!");
        setTimeout(() => navigate("/admin-login"), 2000);
      } else {
        toast.error(data.message || "การสร้างแอดมินล้มเหลว");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  if (showMasterSetup) {
    return (
      <div className="bg-white dark:bg-gray-900">
        <Toaster position="top-right" />
        <div className="container flex items-center justify-center min-h-screen px-6 mx-auto">
          <div className="w-full max-w-md text-center">
            <img className="w-auto h-7 sm:h-8 mx-auto" src={logo} alt="logo" />
            <h1 className="mt-3 text-2xl font-semibold text-gray-800 capitalize sm:text-3xl dark:text-white">
              ตั้งค่าระบบครั้งแรก
            </h1>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              ยังไม่มี Master Admin ในระบบ<br/>
              คลิกปุ่มด้านล่างเพื่อสร้าง Master Admin
            </p>
            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                ข้อมูล Master Admin
              </h3>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p><strong>Master ID:</strong> EROGUN</p>
                <p><strong>Email:</strong> erogun@admin.com</p>
                <p><strong>Password:</strong> ErogunMaster123</p>
                <p><strong>Role:</strong> Admin (Owner Master ID)</p>
              </div>
            </div>
            <button
              onClick={createMasterAdmin}
              disabled={loading}
              className="w-full mt-6 px-6 py-3 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm disabled:opacity-50"
            >
              {loading ? "กำลังสร้าง..." : "สร้าง Master Admin"}
            </button>
            <div className="mt-6 text-center">
              <Link
                to="/admin-login"
                className="text-sm text-blue-500 hover:underline dark:text-blue-400"
              >
                มี Master Admin แล้ว? เข้าสู่ระบบ
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      <Toaster position="top-right" />
      <div className="container flex items-center justify-center min-h-screen px-6 mx-auto">
        <form className="w-full max-w-lg" onSubmit={handleRegister}>
          <img className="w-auto h-7 sm:h-8" src={logo} alt="logo" />
          <h1 className="mt-3 text-2xl font-semibold text-gray-800 capitalize sm:text-3xl dark:text-white">
            สร้างแอดมินใหม่
          </h1>
          
          {/* Email */}
          <div className="relative flex items-center mt-8">
            <span className="absolute">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-3 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full py-3 text-gray-700 bg-white border rounded-lg px-11 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              placeholder="อีเมล"
              required
            />
          </div>

          {/* Name */}
          <div className="relative flex items-center mt-4 gap-2">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="block w-full px-4 py-3 text-gray-700 bg-white border rounded-lg dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              placeholder="ชื่อ"
              required
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="block w-full px-4 py-3 text-gray-700 bg-white border rounded-lg dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              placeholder="นามสกุล"
              required
            />
          </div>

          {/* Master ID */}
          <div className="relative flex items-center mt-4">
            <span className="absolute">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-3 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </span>
            <input
              type="text"
              value={masterID}
              onChange={(e) => setMasterID(e.target.value.toUpperCase())}
              className="block w-full px-10 py-3 text-gray-700 bg-white border rounded-lg dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              placeholder="Master ID (6 ตัวอักษร)"
              maxLength="6"
              pattern="[A-Z0-9]{6}"
              required
            />
          </div>

          {/* Password */}
          <div className="relative flex items-center mt-4">
            <span className="absolute">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-3 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-10 py-3 text-gray-700 bg-white border rounded-lg dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              placeholder="รหัสผ่าน"
              required
            />
          </div>

          {/* Phone */}
          <div className="relative flex items-center mt-4">
            <span className="absolute">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-3 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </span>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="block w-full px-10 py-3 text-gray-700 bg-white border rounded-lg dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              placeholder="เบอร์โทรศัพท์"
              required
            />
          </div>

          {/* Role */}
          <div className="relative flex items-center mt-4">
            <span className="absolute">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-3 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="block w-full px-10 py-3 text-gray-700 bg-white border rounded-lg dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              required
            >
              {roles.map((roleOption) => (
                <option key={roleOption.value} value={roleOption.value}>
                  {roleOption.label} (Level {roleOption.level})
                </option>
              ))}
            </select>
          </div>

          {/* Role Description */}
          {role && roles.find(r => r.value === role) && (
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>หน้าที่:</strong> {roles.find(r => r.value === role)?.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                <strong>สิทธิ์:</strong> {roles.find(r => r.value === role)?.permissions.join(', ')}
              </p>
            </div>
          )}

          <div className="mt-6">
            <button 
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm disabled:opacity-50"
            >
              {loading ? "กำลังสร้าง..." : "สร้างแอดมิน"}
            </button>
            <div className="mt-6 text-center">
              <Link
                to="/admin-login"
                className="text-sm text-blue-500 hover:underline dark:text-blue-400"
              >
                มีบัญชีแล้ว? เข้าสู่ระบบ
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}