import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../Styles/loader.css";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";
import { getProductImage } from "../utils/productImages";

const productsPerPage = 12;

export default function Products() {
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/products");
        const data = await response.json();
        const productsData = data.products || data.data || data || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products: ", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter and sort
  const filteredProducts = products
    .filter((p) =>
      searchTerm
        ? p.name?.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    )
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return 0;
    });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Reset to page 1 when filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">All Products</h1>
          <p className="text-gray-300">
            Browse our entire collection of {products.length} products
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field !pl-10 !py-2.5 text-sm"
            />
          </div>
          {/* Sort */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all cursor-pointer"
            >
              <option value="default">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A–Z</option>
            </select>
            <span className="text-sm text-gray-400">
              {filteredProducts.length} items
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader"></div>
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSortBy("default");
              }}
              className="btn-primary text-sm"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {currentProducts.map((product) => {
                const hasDiscount = product.discount > 0;
                const originalPrice = product.price;
                const discountedPrice = hasDiscount
                  ? originalPrice * (1 - product.discount / 100)
                  : originalPrice;

                return (
                  <Link
                    key={product._id}
                    to={`/product/${product._id}`}
                    className="group block"
                  >
                    <div className="product-card">
                      <div className="relative overflow-hidden aspect-w-1 aspect-h-1 bg-gray-50">
                        <div>
                          <img
                            src={getProductImage(product)}
                            alt={product.imageAlt || product.name}
                            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                          />
                          {hasDiscount && (
                            <span className="absolute top-3 left-3 z-10 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 shadow-md">
                              -{product.discount}%
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-end justify-center pb-4">
                            <span className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-white text-gray-900 text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
                              View Details
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-brand-500 transition-colors">
                          {product.name}
                        </h3>
                        <div className="mt-2 flex items-center gap-2">
                          {hasDiscount ? (
                            <>
                              <span className="text-lg font-bold text-brand-500">
                                ${discountedPrice.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-400 line-through">
                                ${originalPrice.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">
                              ${originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <FiChevronLeft className="w-4 h-4" /> Prev
                </button>

                {Array.from(
                  { length: Math.min(5, totalPages) },
                  (_, i) => {
                    const pageNum =
                      totalPages <= 5
                        ? i + 1
                        : currentPage <= 3
                        ? i + 1
                        : currentPage >= totalPages - 2
                        ? totalPages - 4 + i
                        : currentPage - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-xl transition-all ${
                          pageNum === currentPage
                            ? "bg-brand-500 text-white shadow-md shadow-brand-200"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}

                <button
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
