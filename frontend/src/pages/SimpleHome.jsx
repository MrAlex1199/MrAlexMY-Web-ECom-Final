import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

export default function SimpleHome() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products from Home...');
        const response = await fetch(`${API_BASE_URL}/api/products`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Products data:', data);
        
        setProducts(Array.isArray(data) ? data.slice(0, 8) : []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products: ", error);
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error: {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to Our Store
          </h1>
          <p className="text-xl mb-8">
            Discover amazing products at great prices
          </p>
          <Link 
            to="/products" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <Link to={`/product/${product._id}`}>
                  <img 
                    src={product.imageSrc} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">
                        ${product.price}
                      </span>
                      {product.discount > 0 && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                          -{product.discount}%
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-2">
                      Stock: {product.stock_remaining}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">No products available</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link 
            to="/products" 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </div>
  );
}