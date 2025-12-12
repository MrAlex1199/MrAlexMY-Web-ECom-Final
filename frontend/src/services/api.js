// Remove toast imports to avoid circular dependency issues
// import { showError, showLoading, dismissToast } from '../utils/toast';

// Import centralized API URL
import { API_BASE_URL } from '../config/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method for making requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token') || localStorage.getItem('AToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUserData() {
    return this.request('/user');
  }

  // Admin endpoints
  async adminLogin(credentials) {
    return this.request('/admin-login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async adminRegister(adminData) {
    return this.request('/admin-register', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  }

  async getAdminData() {
    return this.request('/admin');
  }

  // Product endpoints
  async getProducts() {
    return this.request('/api/products');
  }

  async getProduct(id) {
    return this.request(`/api/products/${id}`);
  }

  async createProduct(productData) {
    return this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async addDiscount(id, discount) {
    return this.request(`/api/products/${id}/discount`, {
      method: 'PUT',
      body: JSON.stringify({ discount }),
    });
  }

  async removeDiscount(id) {
    return this.request(`/api/products/${id}/remove-discount`, {
      method: 'PUT',
    });
  }

  // Cart endpoints
  async getCart(userId) {
    return this.request(`/cart/${userId}`);
  }

  async addToCart(cartData) {
    return this.request('/save-selected-products', {
      method: 'POST',
      body: JSON.stringify(cartData),
    });
  }

  async updateCartQuantity(userId, productId, quantity) {
    return this.request(`/cart/update-quantity/${userId}/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(userId, productId) {
    return this.request(`/cart/delete-product/${userId}/${productId}`, {
      method: 'DELETE',
    });
  }

  async clearCart(userId) {
    return this.request(`/cart/clear/${userId}`, {
      method: 'DELETE',
    });
  }

  // Order endpoints
  async getOrders(userId) {
    return this.request(`/orders/${userId}`);
  }

  async createOrder(orderData) {
    return this.request('/orders/save', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async validateStock(productSelected) {
    return this.request('/api/validate-stock', {
      method: 'POST',
      body: JSON.stringify({ productSelected }),
    });
  }

  // Comment endpoints
  async addComment(productId, commentData) {
    return this.request(`/products/${productId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  async deleteComment(productId, commentId) {
    return this.request(`/api/products/${productId}/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  // Address endpoints
  async saveAddress(addressData) {
    return this.request('/save-address', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(userId, addressId, addressData) {
    return this.request(`/update-address/${userId}/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(userId, addressId) {
    return this.request(`/delete-address/${userId}/${addressId}`, {
      method: 'DELETE',
    });
  }

  // Admin endpoints
  async getAdminOrders() {
    return this.request('/admin/orders');
  }

  async updateOrder(orderId, orderData) {
    return this.request(`/admin/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(orderId) {
    return this.request(`/admin/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  async getUsers() {
    return this.request('/api/users');
  }

  async getAdmins() {
    return this.request('/api/admins');
  }

  // File upload endpoints
  async uploadImages(formData) {
    return this.request('/api/upload-images', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  async uploadCSV(formData) {
    return this.request('/api/upload-csv-products', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  // Utility methods
  async changePassword(passwordData) {
    return this.request('/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async deleteAccount(userId) {
    return this.request(`/deleteAccount/${userId}`, {
      method: 'DELETE',
    });
  }

  async getStockLevels(productIds) {
    return this.request('/api/products/stock', {
      method: 'POST',
      body: JSON.stringify({ productIds }),
    });
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;