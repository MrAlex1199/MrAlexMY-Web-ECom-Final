// API Configuration for Production/Development
// This file centralizes all API URL configuration

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Helper function to build API URLs
export const buildUrl = (path) => `${API_BASE_URL}${path}`;

// Common API endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API_BASE_URL}/login`,
    API_LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    USER: `${API_BASE_URL}/api/auth/user`,
    ADMIN: `${API_BASE_URL}/api/auth/admin`,
    ADMIN_LOGIN: `${API_BASE_URL}/api/auth/admin-login`,
    ADMIN_REGISTER: `${API_BASE_URL}/api/auth/admin-register`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
    CHANGE_EMAIL: `${API_BASE_URL}/api/auth/change-email`,
    DELETE_ACCOUNT: `${API_BASE_URL}/api/auth/delete-account`,
    ROLES: `${API_BASE_URL}/api/auth/roles`,
    CREATE_MASTER_ADMIN: `${API_BASE_URL}/api/auth/create-master-admin`,
  },
  // Products
  PRODUCTS: {
    BASE: `${API_BASE_URL}/api/products`,
    BY_ID: (id) => `${API_BASE_URL}/api/products/${id}`,
    STOCK: `${API_BASE_URL}/api/products/stock`,
    UPLOAD_CSV: `${API_BASE_URL}/api/products/upload-csv`,
    UPLOAD_IMAGES: `${API_BASE_URL}/api/products/upload-images`,
    COMMENTS: (id) => `${API_BASE_URL}/api/products/${id}/comments`,
    DELETE_COMMENT: (productId, commentId) => `${API_BASE_URL}/api/products/${productId}/comments/${commentId}`,
    DISCOUNT: (id) => `${API_BASE_URL}/api/products/${id}/discount`,
    REMOVE_DISCOUNT: (id) => `${API_BASE_URL}/api/products/${id}/remove-discount`,
  },
  // Cart
  CART: {
    BASE: `${API_BASE_URL}/api/cart`,
    BY_USER: (userId) => `${API_BASE_URL}/api/cart/${userId}`,
    SAVE: `${API_BASE_URL}/save-selected-products`,
    DELETE_PRODUCT: (userId, productId) => `${API_BASE_URL}/api/cart/delete-product/${userId}/${productId}`,
    UPDATE_QUANTITY: (userId, productId) => `${API_BASE_URL}/api/cart/update-quantity/${userId}/${productId}`,
    CLEAR: (userId) => `${API_BASE_URL}/api/cart/clear/${userId}`,
  },
  // Orders
  ORDERS: {
    BASE: `${API_BASE_URL}/api/orders`,
    SAVE: `${API_BASE_URL}/api/orders/save`,
    BY_USER: (userId) => `${API_BASE_URL}/api/orders/${userId}`,
    BY_ID: (orderId) => `${API_BASE_URL}/api/orders/${orderId}`,
    ADMIN_ALL: `${API_BASE_URL}/api/orders/admin/all`,
    UPDATE_STATUS: (orderId) => `${API_BASE_URL}/api/orders/${orderId}/status`,
  },
  // Users
  USERS: {
    BASE: `${API_BASE_URL}/api/users`,
    ADMINS: `${API_BASE_URL}/api/users/admins`,
    SAVE_ADDRESS: `${API_BASE_URL}/api/users/save-address`,
    DELETE_ADDRESS: (userId, addressId) => `${API_BASE_URL}/api/users/delete-address/${userId}/${addressId}`,
    UPDATE_ADDRESS: (userId, addressId) => `${API_BASE_URL}/api/users/update-address/${userId}/${addressId}`,
  },
  // Validation
  VALIDATE_STOCK: `${API_BASE_URL}/api/validate-stock`,
};

export { API_BASE_URL };
export default API_ENDPOINTS;
