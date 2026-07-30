import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import Sidebar from "../../components/AdminComponents/Sidebar";
import Header from "../../components/AdminComponents/header";
import {
  Users, Package, DollarSign, TrendingUp, ShoppingCart,
  Calendar, Download, ChevronRight
} from "lucide-react";
import "../../Styles/loader.css";

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, Title, Filler
);

export default function Overview({ adminData }) {
  const [loading, setLoading] = useState(false); // Start with false to show dashboard immediately
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dateRange, setDateRange] = useState("last7days");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeDiscounts: 0,
    soldOutProducts: 0,
    todayOrders: 0,
  });
  const [chartData, setChartData] = useState({
    salesByDay: { labels: [], datasets: [] },
    revenueByMonth: { labels: [], datasets: [] },
    ageGroups: { labels: [], datasets: [] },
  });

  // ฟังก์ชันกรองออเดอร์ตามช่วงเวลา
  const filterOrdersByRange = (orders, range) => {
    const now = new Date();
    let startDate;

    switch (range) {
      case "last7days":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        break;
      case "last30days":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 29);
        break;
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "lastYear":
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
    }

    startDate.setHours(0, 0, 0, 0);
    return orders.filter(o => new Date(o.createdAt) >= startDate);
  };

  // สร้างกราฟยอดออเดอร์ตามวัน
  const generateSalesByDay = (filteredOrders, currentDateRange) => {
    const labels = [];
    const data = [];

    if (currentDateRange === "last7days") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric' }));
      }
    } else if (currentDateRange === "last30days") {
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.getDate().toString());
      }
    } else {
      labels.push("สัปดาห์ 1", "สัปดาห์ 2", "สัปดาห์ 3", "สัปดาห์ 4");
    }

    data.push(
      ...labels.map(label => {
        return filteredOrders.filter(o => {
          const orderDateStr = new Date(o.createdAt).toLocaleDateString('th-TH', { 
            weekday: 'short', 
            day: 'numeric' 
          });
          if (currentDateRange === "last30days") {
            return new Date(o.createdAt).getDate().toString() === label;
          }
          return orderDateStr === label;
        }).length;
      })
    );

    return {
      labels,
      datasets: [{
        label: 'จำนวนออเดอร์',
        data,
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
        borderColor: '#8B5CF6',
        borderWidth: 2,
        borderRadius: 8,
      }],
    };
  };

  // สร้างกราฟรายได้รายเดือน
  const generateRevenueByMonth = (filteredOrders) => {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const now = new Date();
    const currentMonth = now.getMonth();
    const labels = months.slice(0, currentMonth + 1);

    const revenue = labels.map((_, index) => {
      return filteredOrders
        .filter(o => new Date(o.createdAt).getMonth() === index)
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    });

    return {
      labels,
      datasets: [{
        label: 'รายได้ (บาท)',
        data: revenue,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
      }],
    };
  };

  // สร้างกราฟกลุ่มอายุ
  const generateAgeGroups = (users) => {
    const groups = { '18-22': 0, '23-30': 0, '31-40': 0, '41-50': 0, '51+': 0 };
    
    users.forEach(u => {
      // ถ้าไม่มี birthdate ใช้ createdAt แทน
      const birthDate = u.birthdate ? new Date(u.birthdate) : new Date(u.createdAt);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      
      if (age >= 18 && age <= 22) groups['18-22']++;
      else if (age <= 30) groups['23-30']++;
      else if (age <= 40) groups['31-40']++;
      else if (age <= 50) groups['41-50']++;
      else if (age >= 51) groups['51+']++;
    });

    return {
      labels: Object.keys(groups),
      datasets: [{
        data: Object.values(groups),
        backgroundColor: [
          '#8B5CF6', '#F59E0B', '#10B981', 
          '#EF4444', '#06B6D4'
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverBorderColor: '#ffffff',
      }],
    };
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Don't set loading to true immediately, let the dashboard show first
      // setLoading(true);
      try {
        const token = localStorage.getItem("AToken");
        if (!token) {
          console.error("Admin token not found");
          setLoading(false);
          return;
        }

        const headers = {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        };

        // Add timeout to prevent hanging
        const fetchWithTimeout = (url, options, timeout = 10000) => {
          return Promise.race([
            fetch(url, options),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), timeout)
            )
          ]);
        };

        const [usersRes, productsRes, ordersRes] = await Promise.allSettled([
          fetchWithTimeout("http://localhost:3001/api/users/users", { headers }).catch(() => ({ json: () => ({ success: false, users: [] }) })),
          fetchWithTimeout("http://localhost:3001/api/products", { headers }).catch(() => ({ json: () => ({ success: false, products: [] }) })),
          fetchWithTimeout("http://localhost:3001/api/orders/admin/all", { headers }).catch(() => ({ json: () => [] })),
        ]);

        // Handle Promise.allSettled results
        const usersData = usersRes.status === 'fulfilled' ? await usersRes.value.json() : { users: [] };
        const productsData = productsRes.status === 'fulfilled' ? await productsRes.value.json() : { products: [] };
        const ordersData = ordersRes.status === 'fulfilled' ? await ordersRes.value.json() : [];

        // Handle different response formats and ensure arrays
        const users = Array.isArray(usersData.users) ? usersData.users : 
                     Array.isArray(usersData) ? usersData : [];
        const products = Array.isArray(productsData.products) ? productsData.products :
                        Array.isArray(productsData.data) ? productsData.data :
                        Array.isArray(productsData) ? productsData : [];
        const orders = Array.isArray(ordersData.orders) ? ordersData.orders :
                      Array.isArray(ordersData) ? ordersData : [];

        // Ensure all are arrays
        const ordersArray = Array.isArray(orders) ? orders : [];
        const productsArray = Array.isArray(products) ? products : [];
        const usersArray = Array.isArray(users) ? users : [];

        // กรองออเดอร์ตามช่วงเวลา
        const filteredOrders = filterOrdersByRange(ordersArray, dateRange);

        // คำนวณสถิติ
        const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const soldOut = productsArray.filter(p => (p.stock_remaining || 0) === 0).length;
        const activeDiscounts = productsArray.filter(p => (p.discount || 0) > 0).length;

        // ออเดอร์วันนี้
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = filteredOrders.filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate >= today;
        }).length;

        setStats({
          totalUsers: usersArray.length || 0,
          totalProducts: productsArray.length || 0,
          totalOrders: filteredOrders.length || 0,
          totalRevenue: totalRevenue || 0,
          activeDiscounts: activeDiscounts || 0,
          soldOutProducts: soldOut || 0,
          todayOrders: todayOrders || 0,
        });

        // สร้างกราฟ
        const salesByDay = generateSalesByDay(filteredOrders, dateRange);
        const revenueByMonth = generateRevenueByMonth(filteredOrders);
        const ageGroups = generateAgeGroups(usersArray);

        setChartData({ 
          salesByDay, 
          revenueByMonth, 
          ageGroups 
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // ตั้งค่าพื้นฐานถ้า error
        setStats({
          totalUsers: 0, totalProducts: 0, totalOrders: 0,
          totalRevenue: 0, activeDiscounts: 0, soldOutProducts: 0, todayOrders: 0
        });
        setChartData({
          salesByDay: { labels: ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์'], datasets: [{ label: 'จำนวนออเดอร์', data: [0,0,0,0,0,0,0], backgroundColor: 'rgba(139, 92, 246, 0.7)' }] },
          revenueByMonth: { labels: ['ม.ค.', 'ก.พ.', 'มี.ค.'], datasets: [{ label: 'รายได้ (บาท)', data: [0,0,0], borderColor: '#10B981' }] },
          ageGroups: { labels: ['18-22', '23-30', '31-40'], datasets: [{ data: [0,0,0], backgroundColor: ['#8B5CF6', '#F59E0B', '#10B981'] }] }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Fallback timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("Dashboard loading timeout, forcing completion");
        setLoading(false);
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timeoutId);
  }, [dateRange]); // Removed generateSalesByDay from dependency array to prevent infinite loop

  // Auto-refresh dashboard data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Auto-refreshing dashboard data...");
      const fetchDashboardData = async () => {
        try {
          const token = localStorage.getItem("AToken");
          if (!token) return;

          const headers = {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          };

          const fetchWithTimeout = (url, options, timeout = 10000) => {
            return Promise.race([
              fetch(url, options),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), timeout)
              )
            ]);
          };

          const [usersRes, productsRes, ordersRes] = await Promise.allSettled([
            fetchWithTimeout("http://localhost:3001/api/users/users", { headers }).catch(() => ({ json: () => ({ success: false, users: [] }) })),
            fetchWithTimeout("http://localhost:3001/api/products", { headers }).catch(() => ({ json: () => ({ success: false, products: [] }) })),
            fetchWithTimeout("http://localhost:3001/api/orders/admin/all", { headers }).catch(() => ({ json: () => [] })),
          ]);

          // Handle Promise.allSettled results
          const usersData = usersRes.status === 'fulfilled' ? await usersRes.value.json() : { users: [] };
          const productsData = productsRes.status === 'fulfilled' ? await productsRes.value.json() : { products: [] };
          const ordersData = ordersRes.status === 'fulfilled' ? await ordersRes.value.json() : [];

          // Handle different response formats and ensure arrays
          const users = Array.isArray(usersData.users) ? usersData.users : 
                       Array.isArray(usersData) ? usersData : [];
          const products = Array.isArray(productsData.products) ? productsData.products :
                          Array.isArray(productsData.data) ? productsData.data :
                          Array.isArray(productsData) ? productsData : [];
          const orders = Array.isArray(ordersData.orders) ? ordersData.orders :
                        Array.isArray(ordersData) ? ordersData : [];

          // Ensure all are arrays
          const ordersArray = Array.isArray(orders) ? orders : [];
          const productsArray = Array.isArray(products) ? products : [];
          const usersArray = Array.isArray(users) ? users : [];

          // กรองออเดอร์ตามช่วงเวลา
          const filteredOrders = filterOrdersByRange(ordersArray, dateRange);

          // คำนวณสถิติ
          const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
          const soldOut = productsArray.filter(p => (p.stock_remaining || 0) === 0).length;
          const activeDiscounts = productsArray.filter(p => (p.discount || 0) > 0).length;

          // ออเดอร์วันนี้
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayOrders = filteredOrders.filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate >= today;
          }).length;

          setStats({
            totalUsers: usersArray.length || 0,
            totalProducts: productsArray.length || 0,
            totalOrders: filteredOrders.length || 0,
            totalRevenue: totalRevenue || 0,
            activeDiscounts: activeDiscounts || 0,
            soldOutProducts: soldOut || 0,
            todayOrders: todayOrders || 0,
          });

          // สร้างกราฟ
          const salesByDay = generateSalesByDay(filteredOrders, dateRange);
          const revenueByMonth = generateRevenueByMonth(filteredOrders);
          const ageGroups = generateAgeGroups(usersArray);

          setChartData({ 
            salesByDay, 
            revenueByMonth, 
            ageGroups 
          });
        } catch (error) {
          console.error("Auto-refresh error:", error);
        }
      };
      
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [dateRange]);

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { 
          usePointStyle: true,
          padding: 20,
          font: { size: 12 }
        } 
      },
    },
  };

  const barLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        position: 'top',
        labels: { font: { size: 12 } }
      } 
    },
    scales: { 
      y: { 
        beginAtZero: true,
        ticks: { font: { size: 11 } }
      },
      x: { ticks: { font: { size: 11 } } }
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="loader w-16 h-16"></div>
          <p className="text-gray-600 font-medium">กำลังโหลดข้อมูลแดชบอร์ด...</p>
        </div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-red-600 text-xl">⚠️</div>
          <p className="text-gray-600 font-medium">ไม่พบข้อมูลผู้ดูแลระบบ</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            รีโหลดหน้า
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <Header
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          textpage="ภาพรวมระบบ"
          AdminData={adminData}
        />

        <div className="p-6 space-y-6 mx-auto">
          {/* Header with Date Range */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  แดชบอร์ดภาพรวม
                </h1>
                <p className="text-gray-600 mt-1">
                  ภาพรวมข้อมูลระบบทั้งหมด {dateRange === "last7days" ? "7 วันล่าสุด" : 
                  dateRange === "last30days" ? "30 วันล่าสุด" : 
                  dateRange === "thisMonth" ? "เดือนนี้" : "ปีที่แล้ว"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm"
                >
                  <option value="last7days">7 วันล่าสุด</option>
                  <option value="last30days">30 วันล่าสุด</option>
                  <option value="thisMonth">เดือนนี้</option>
                  <option value="lastYear">ปีที่แล้ว</option>
                </select>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-200">
                  <Download className="w-4 h-4" />
                  Export รายงาน
                </button>
              </div>
            </div>
          </div>

          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Users, 
                label: "ลูกค้าทั้งหมด", 
                value: stats.totalUsers.toLocaleString(), 
                color: "text-purple-600", 
                bg: "bg-gradient-to-br from-purple-50 to-indigo-50",
                change: "+12%"
              },
              { 
                icon: Package, 
                label: "สินค้าทั้งหมด", 
                value: stats.totalProducts.toLocaleString(), 
                color: "text-blue-600", 
                bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
                change: "+5%"
              },
              { 
                icon: ShoppingCart, 
                label: "ออเดอร์ทั้งหมด", 
                value: stats.totalOrders.toLocaleString(), 
                color: "text-emerald-600", 
                bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
                change: "+28%"
              },
              { 
                icon: DollarSign, 
                label: "รายได้รวม", 
                value: `฿${stats.totalRevenue.toLocaleString()}`, 
                color: "text-amber-600", 
                bg: "bg-gradient-to-br from-amber-50 to-orange-50",
                change: "+15%"
              },
            ].map((kpi, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{kpi.label}</p>
                    <p className={`text-3xl font-bold ${kpi.color} mt-2 leading-tight`}>
                      {kpi.value}
                    </p>
                    <p className="text-sm font-medium text-emerald-600 mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {kpi.change}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${kpi.bg}`}>
                    <kpi.icon className={`w-7 h-7 ${kpi.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ออเดอร์วันนี้</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-2">{stats.todayOrders}</p>
                </div>
                <Calendar className="w-10 h-10 text-indigo-500/20" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">สินค้าหมด</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">{stats.soldOutProducts}</p>
                </div>
                <Package className="w-10 h-10 text-red-500/20" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">โปรโมชันใช้งาน</p>
                  <p className="text-2xl font-bold text-amber-600 mt-2">{stats.activeDiscounts}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-amber-500/20" />
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Sales by Day */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
                ยอดออเดอร์ {dateRange === "last7days" ? "7 วันล่าสุด" : "30 วันล่าสุด"}
              </h3>
              <div className="h-80">
                <Bar data={chartData.salesByDay} options={barLineOptions} />
              </div>
            </div>

            {/* Revenue by Month */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                รายได้รายเดือน
              </h3>
              <div className="h-80">
                <Line data={chartData.revenueByMonth} options={barLineOptions} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Age Groups */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                กลุ่มอายุลูกค้า
              </h3>
              <div className="h-80 flex justify-center items-center">
                <Pie data={chartData.ageGroups} options={pieOptions} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">ดำเนินการด่วน</h3>
              <div className="space-y-4">
                {[
                  { icon: Package, label: "เพิ่มสินค้าใหม่", color: "text-blue-600", to: "/adminmanageproducts" },
                  { icon: TrendingUp, label: "จัดการโปรโมชัน", color: "text-emerald-600", to: "/adminpromotions" },
                  { icon: ShoppingCart, label: "ดูออเดอร์ล่าสุด", color: "text-purple-600", to: "/adminmanageorders" },
                  { icon: Users, label: "จัดการลูกค้า", color: "text-indigo-600", to: "/adminmanagecustomrs" },
                ].map((action, i) => (
                  <Link
                    key={i}
                    to={action.to}
                    className="group flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:from-blue-100`}>
                        <action.icon className={`w-5 h-5 ${action.color}`} />
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-blue-600">{action.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}