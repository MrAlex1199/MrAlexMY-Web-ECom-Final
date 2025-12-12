import React, { useState, useEffect } from "react";
import "./Styles/App.css";
import Footer from "./components/footer";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Home from "./pages/home";
// import SimpleHome from "./pages/SimpleHome";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import Services from "./pages/Services";
import ProdutsDetails from "./pages/ProdutsDetails";
import ProductsFilter from "./pages/ProductsFilter";
import Cart from "./pages/cart";
import Setting from "./pages/SettingUser";
import Shipping from "./pages/Shipinglocation";
import Orderstatus from "./pages/Orderstatus";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import CheckoutPage from "./pages/CheckoutPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminDashboard from "./pages/AdminPage/AdminDashboard";
import AdminRegister from "./pages/AdminPage/AdminRegister";
import AdminLogin from "./pages/AdminPage/AdminLogin";
import AdminManageProducts from "./pages/AdminPage/AdminProducts";
import AdminManageOrders from "./pages/AdminPage/AdminOrders";
import AdminManageCustomers from "./pages/AdminPage/AdminCustomers";
import AdminPromotions from "./pages/AdminPage/AdminPromotions";
import AdminTeam from "./pages/AdminPage/AdminTeam";
import TestPage from "./pages/TestPage";
import TestRegister from "./pages/TestRegister";
import PasswordReset from "./pages/PasswordReset";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true); // Add loading state
  
  // FIX: Initialize userData with address as an empty array
  const [userData, setUserData] = useState({
    fname: "",
    lname: "",
    userId: "",
    address: [], 
  });

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [adminData, setAdminData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const shouldShowNavbar = !window.location.pathname.toLowerCase().startsWith('/admin');
  const shouldShowFooter = !window.location.pathname.toLowerCase().startsWith('/admin');

  useEffect(() => {
    const fetchAdminDetails = async () => {
      setAdminLoading(true);
      
      const Atoken = localStorage.getItem("AToken");
      const isAdminStored = localStorage.getItem("isAdmin") === "true";
      
      console.log("Admin auth check:", { 
        hasToken: !!Atoken, 
        isAdminStored, 
        currentPath: window.location.pathname 
      });
      
      if (!Atoken || !isAdminStored) {
        console.log("No admin token or flag, clearing admin state");
        setIsAdmin(false);
        setAdminData(null);
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("AToken");
        localStorage.removeItem("adminLastVerified");
        localStorage.removeItem("cachedAdminData");
        setAdminLoading(false);
        return;
      }
      
      // Check if we recently verified (within last 5 minutes)
      const lastVerified = localStorage.getItem("adminLastVerified");
      const cachedAdminData = localStorage.getItem("cachedAdminData");
      const now = Date.now();
      if (lastVerified && (now - parseInt(lastVerified)) < 5 * 60 * 1000) {
        console.log("Admin recently verified, skipping check");
        setIsAdmin(true);
        
        // Set cached admin data if available
        if (cachedAdminData) {
          try {
            const parsedAdminData = JSON.parse(cachedAdminData);
            setAdminData(parsedAdminData);
            // console.log("Using cached admin data:", parsedAdminData);
          } catch (error) {
            console.error("Error parsing cached admin data:", error);
            // If cached data is corrupted, we'll fetch fresh data
            localStorage.removeItem("cachedAdminData");
            localStorage.removeItem("adminLastVerified");
            setAdminLoading(false);
            return;
          }
        } else {
          console.log("No cached admin data found, will need fresh verification");
          // Clear the verification timestamp so we fetch fresh data
          localStorage.removeItem("adminLastVerified");
          setAdminLoading(false);
          return;
        }
        
        setAdminLoading(false);
        return;
      }
      
      try {
        console.log("Verifying admin token...");
        const response = await fetch("http://localhost:3001/api/auth/admin", {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${Atoken}`,
            "Content-Type": "application/json"
          },
        });

        console.log("Admin verification response:", response.status);

        if (response.status === 429) {
          console.log("Rate limited, assuming admin is still valid");
          setIsAdmin(true);
          setAdminLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Admin data received:", data.success);
        
        if (data.success) {
          const adminData = data.admin || data;
          setAdminData(adminData);
          setIsAdmin(true);
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem("adminLastVerified", now.toString());
          
          // Cache admin data for future use
          try {
            localStorage.setItem("cachedAdminData", JSON.stringify(adminData));
          } catch (error) {
            console.error("Error caching admin data:", error);
          }
          
          console.log("Admin authenticated successfully");
        } else {
          console.log("Admin verification failed");
          setIsAdmin(false);
          setAdminData(null);
          localStorage.removeItem("isAdmin");
          localStorage.removeItem("AToken");
          localStorage.removeItem("adminLastVerified");
          localStorage.removeItem("cachedAdminData");
        }
      } catch (error) {
        console.error("Error fetching admin details:", error);
        // Only clear auth on actual auth errors, not rate limiting
        if (error.message && !error.message.includes('429')) {
          setIsAdmin(false);
          setAdminData(null);
          localStorage.removeItem("isAdmin");
          localStorage.removeItem("AToken");
          localStorage.removeItem("adminLastVerified");
          localStorage.removeItem("cachedAdminData");
        } else {
          // On rate limiting, assume admin is still valid if token exists
          setIsAdmin(true);
          
          // Try to use cached admin data if available
          const cachedAdminData = localStorage.getItem("cachedAdminData");
          if (cachedAdminData) {
            try {
              const parsedAdminData = JSON.parse(cachedAdminData);
              setAdminData(parsedAdminData);
            } catch (parseError) {
              console.error("Error parsing cached admin data:", parseError);
            }
          }
        }
      } finally {
        setAdminLoading(false);
      }
    };
    
    fetchAdminDetails();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch("http://localhost:3001/api/auth/user", {
            method: "GET",
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
          });

          if (!response.ok) throw new Error("Failed to fetch user details");

          const data = await response.json();
          if (data.success) {
            setUserData({
              userId: data.userId,
              email: data.email,
              fname: data.fname,
              lname: data.lname,
              address: data.address || [], // Ensure address is always an array
            });
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
          setIsLoggedIn(false);
        }
      }
    };
    fetchUserDetails();
  }, [isLoggedIn]); // Add isLoggedIn as dependency to refetch when login state changes

  useEffect(() => {
    const fetchSelectedProducts = async () => {
      if (userData.userId) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`http://localhost:3001/api/cart/${userData.userId}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          
          if (!response.ok) {
            if (response.status === 401) {
              console.log("User not authenticated, cart will be empty");
              setSelectedProducts([]);
              return;
            }
            throw new Error("Failed to fetch selected products");
          }
          
          const data = await response.json();
          if (data.success) {
            setSelectedProducts(data.selectedProducts || []);
          } else {
            setSelectedProducts([]);
          }
        } catch (error) {
          console.error("Error fetching selected products:", error);
          setSelectedProducts([]);
        }
      }
    };

    fetchSelectedProducts();
  }, [userData.userId]);

  return (
    <ErrorBoundary>
      <Router>
        {shouldShowNavbar && (
          <Navbar
            isLoggedIn={isLoggedIn}
            userData={userData}
            selectedProducts={selectedProducts}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
          />
        )}
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/test-register" element={<TestRegister />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/SettingUser" element={<Setting userData={userData} />} />
        <Route path="/ShippingLocations" element={<Shipping userData={userData} userId={userData.userId} />} />
        <Route path="/Orderstatus" element={<Orderstatus userData={userData} userId={userData.userId} />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/products" element={<Products />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/checkoutPage" element={<CheckoutPage userId={userData.userId} selectedProducts={selectedProducts} />} />
        <Route path="/product/:id" element={<ProdutsDetails userId={userData.userId} userData={userData} />} />
        <Route path="/products/:category" element={<ProductsFilter userId={userData.userId} />} />
        <Route path="/products/:category/:subcategory" element={<ProductsFilter userId={userData.userId} />} />
        <Route
          path="/cart"
          element={
            <Cart
              userId={userData.userId}
              userData={userData}
              selectedProducts={selectedProducts}
              setSelectedProducts={setSelectedProducts}
            />
          }
        />
        <Route path="/login" element={!isLoggedIn ? <Login setIsLoggedIn={setIsLoggedIn} setUserData={setUserData} /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!isLoggedIn ? <Register /> : <Navigate to="/" replace />} />
        <Route path="/reset-password" element={<PasswordReset />} />
        
        {/* Admin Routes */}
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/admin-login" element={<AdminLogin setIsAdmin={setIsAdmin} setAdminData={setAdminData} />} />
        <Route path="/admin" element={<Navigate to="/admindashboard" replace />} />
        <Route path="/admindashboard" element={<ProtectedRoute isAdmin={isAdmin} adminLoading={adminLoading}><AdminDashboard adminData={adminData} /></ProtectedRoute>} />
        <Route path="/adminmanageproducts" element={<ProtectedRoute isAdmin={isAdmin} adminLoading={adminLoading}><AdminManageProducts adminData={adminData} /></ProtectedRoute>} />
        <Route path="/adminmanageorders" element={<ProtectedRoute isAdmin={isAdmin} adminLoading={adminLoading}><AdminManageOrders adminData={adminData} /></ProtectedRoute>} />
        <Route path="/adminmanagecustomrs" element={<ProtectedRoute isAdmin={isAdmin} adminLoading={adminLoading}><AdminManageCustomers adminData={adminData} /></ProtectedRoute>} />
        <Route path="/adminpromotions" element={<ProtectedRoute isAdmin={isAdmin} adminLoading={adminLoading}><AdminPromotions adminData={adminData} /></ProtectedRoute>} />
        <Route path="/adminteam" element={<ProtectedRoute isAdmin={isAdmin} adminLoading={adminLoading}><AdminTeam adminData={adminData} /></ProtectedRoute>} />
        </Routes>
        {shouldShowFooter && <Footer />}
        <Toaster 
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
          }}
        />
      </Router>
    </ErrorBoundary>
  );
}