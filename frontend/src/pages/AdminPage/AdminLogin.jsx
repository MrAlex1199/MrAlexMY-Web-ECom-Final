import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import logo from '../../components/logo/weblogo.jpg';
import { API_BASE_URL } from '../../config/api';

export default function AdminLogin({ setIsAdmin, setAdminData }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    // Only redirect if we're sure the user is already authenticated
    const checkAuth = async () => {
      const token = localStorage.getItem('AToken');
      const isAdminStored = localStorage.getItem('isAdmin') === 'true';
      const lastVerified = localStorage.getItem('adminLastVerified');
      const now = Date.now();
      
      if (token && isAdminStored) {
        // If recently verified (within 5 minutes), skip API call
        if (lastVerified && (now - parseInt(lastVerified)) < 5 * 60 * 1000) {
          navigate('/admindashboard');
          return;
        }
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/admin`, {
            method: 'GET',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });
          
          if (response.status === 429) {
            // Rate limited, but assume still valid if token exists
            navigate('/admindashboard');
            return;
          }
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              localStorage.setItem('adminLastVerified', now.toString());
              navigate('/admindashboard');
            }
          }
        } catch (error) {
          console.log('Auth check failed:', error);
          // Only clear tokens on non-rate-limit errors
          if (!error.message || !error.message.includes('429')) {
            localStorage.removeItem('AToken');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('adminLastVerified');
            localStorage.removeItem('cachedAdminData');
          }
        }
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Store authentication data
        localStorage.setItem('AToken', data.token);
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminLastVerified', Date.now().toString());
        
        // Cache admin data
        try {
          localStorage.setItem('cachedAdminData', JSON.stringify(data.admin));
        } catch (error) {
          console.error('Error caching admin data:', error);
        }
        
        // Set state
        setIsAdmin(true);
        setAdminData(data.admin);
        
        toast.success(`ยินดีต้อนรับ ${data.admin.firstName}! (${data.admin.role})`);
        
        // Navigate after a short delay to show the toast
        setTimeout(() => {
          navigate('/admindashboard');
        }, 1000);
      } else {
        toast.error(data.message || 'เข้าสู่ระบบล้มเหลว กรุณาตรวจสอบอีเมลและรหัสผ่าน');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      <Toaster position="top-right" />
      <div className="container flex items-center justify-center min-h-screen px-6 mx-auto">
        <div className="w-full max-w-md">
          <img className="w-auto h-7 sm:h-8" src={logo} alt="login" />
          <h1 className="mt-3 text-2xl font-semibold text-gray-800 capitalize sm:text-3xl dark:text-white">เข้าสู่ระบบแอดมิน</h1>
          <form onSubmit={handleLogin}>
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
                placeholder="อีเมลหรือ Master ID"
                required
              />
            </div>
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
            <div className="mt-6">
              <button 
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm disabled:opacity-50"
              >
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
              <div className="mt-6 text-center">
                <a href="/admin-register" className="text-sm text-blue-500 hover:underline dark:text-blue-400">
                  ยังไม่มีบัญชี? สมัครสมาชิก
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}