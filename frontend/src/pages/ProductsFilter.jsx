import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "../Styles/loader.css";
import { FiChevronLeft, FiChevronRight, FiArrowLeft } from "react-icons/fi";
import { getProductImage } from "../utils/productImages";
import { API_BASE_URL } from "../config/api";

const productsPerPage = 12;

export default function ProductFilter() {
  const { category } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        const data = await response.json();
        const productsData = data.products || data.data || data || [];
        const productsArray = Array.isArray(productsData) ? productsData : [];

        const filteredProducts = category
          ? productsArray.filter((product) => {
              const breadcrumbBase = product.breadcrumbs
                ?.split(">")[0]
                ?.trim()
                .toLowerCase();
              return breadcrumbBase === category.trim().toLowerCase();
            })
          : productsArray;
        setProducts(filteredProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products: ", error);
        setLoading(false);
      }
    };
    fetchProducts();
    setCurrentPage(1);
  }, [category]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = Array.isArray(products)
    ? products.slice(indexOfFirstProduct, indexOfLastProduct)
    : [];
  const totalPages = Math.ceil(
    (Array.isArray(products) ? products.length : 0) / productsPerPage
  );

  const categoryTitle = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : "All";

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-4"
          >
            <FiArrowLeft className="w-4 h-4" /> All Products
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            {categoryTitle} Products
          </h1>
          <p className="text-gray-300">
            {products.length} products in this category
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader"></div>
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-6">
              There are no products in the "{categoryTitle}" category yet.
            </p>
            <Link to="/products" className="btn-primary text-sm">
              Browse All Products
            </Link>
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
