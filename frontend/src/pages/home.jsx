import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../Styles/loader.css";
import bg1 from "../components/bg/bg1.jpg";
import bg2 from "../components/bg/bg2.jpg";
import bg3 from "../components/bg/bg3.jpg";
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones } from "react-icons/fi";
import { getProductImage } from "../utils/productImages";
import { API_BASE_URL } from "../config/api";

const productsPerPage = 8;

// Reusable Product Card Component
function ProductCard({ product }) {
  const hasDiscount = product.discount > 0;
  const originalPrice = product.price;
  const discountedPrice = hasDiscount
    ? originalPrice * (1 - product.discount / 100)
    : originalPrice;

  return (
    <Link to={`/product/${product._id}`} className="group block">
      <div className="product-card">
        {/* Image container */}
        <div className="relative overflow-hidden aspect-w-1 aspect-h-1 bg-gray-50">
          <div>
            <img
              src={getProductImage(product)}
              alt={product.imageAlt || product.name}
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
            />
            {/* Badges */}
            {hasDiscount && (
              <span className="absolute top-3 left-3 z-10 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 shadow-md">
                -{product.discount}%
              </span>
            )}
            {/* Quick action overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-end justify-center pb-4">
              <span className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-white text-gray-900 text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
                View Details
              </span>
            </div>
          </div>
        </div>
        {/* Content */}
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
}

// Pagination Component
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <FiChevronLeft className="w-4 h-4" /> Prev
      </button>

      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        const pageNumberToShow =
          totalPages <= 5
            ? i + 1
            : currentPage <= 3
            ? i + 1
            : currentPage >= totalPages - 2
            ? totalPages - 4 + i
            : currentPage - 2 + i;

        return (
          <button
            key={pageNumberToShow}
            onClick={() => onPageChange(pageNumberToShow)}
            className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-xl transition-all ${
              pageNumberToShow === currentPage
                ? "bg-brand-500 text-white shadow-md shadow-brand-200"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            {pageNumberToShow}
          </button>
        );
      })}

      <button
        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carousel content
  const carouselItems = [
    {
      image: bg1,
      alt: "Built for the Mission",
      title: "Premium Quality Products",
      description: "Discover curated collections at unbeatable prices",
      buttonText: "Shop Now",
      accent: "from-brand-500/80 to-brand-700/90",
    },
    {
      image: bg2,
      alt: "Ready for Anything",
      title: "New Season, New Style",
      description: "Explore the latest trends and arrivals",
      buttonText: "Explore",
      accent: "from-accent-500/80 to-accent-700/90",
    },
    {
      image: bg3,
      alt: "Gear Up Now",
      title: "Exclusive Deals",
      description: "Limited time offers — up to 50% off select items",
      buttonText: "View Offers",
      accent: "from-emerald-500/80 to-emerald-700/90",
    },
  ];

  const features = [
    { icon: FiTruck, title: "Free Shipping", desc: "On orders over $50" },
    { icon: FiShield, title: "Secure Payment", desc: "100% protected" },
    { icon: FiRefreshCw, title: "Easy Returns", desc: "30-day guarantee" },
    { icon: FiHeadphones, title: "24/7 Support", desc: "We're here to help" },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        const data = await response.json();
        const productsData = data.products || data.data || data || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products: ", error);
        setProducts([]);
        setLoading(false);
      }
    };
    fetchProducts();

    const interval = setInterval(() => {
      fetchProducts();
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselItems.length]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = Array.isArray(products)
    ? products.slice(indexOfFirstProduct, indexOfLastProduct)
    : [];
  const totalPages = Math.ceil(products.length / productsPerPage);

  return (
    <div className="page-container">
      {/* ===== Hero Carousel ===== */}
      <section className="relative overflow-hidden bg-gray-900" style={{ height: "clamp(350px, 65vh, 600px)" }}>
        {carouselItems.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-105 z-0"
            }`}
          >
            <img
              src={item.image}
              alt={item.alt}
              className="w-full h-full object-cover object-center"
            />
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${item.accent}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className={`max-w-lg transition-all duration-700 delay-200 ${
                  index === currentSlide 
                    ? "translate-y-0 opacity-100" 
                    : "translate-y-8 opacity-0"
                }`}>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 drop-shadow-lg">
                    {item.title}
                  </h2>
                  <p className="text-base sm:text-lg text-white/90 mb-6 drop-shadow">
                    {item.description}
                  </p>
                  <Link
                    to="/products"
                    className="btn-primary inline-flex items-center gap-2 text-base !py-3 !px-8"
                  >
                    {item.buttonText}
                    <FiArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselItems.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 h-2.5 bg-white"
                  : "w-2.5 h-2.5 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ===== Features Strip ===== */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{feature.title}</p>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Featured Products ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Featured Products</h2>
            <p className="text-gray-500 mt-1">Discover our most popular items</p>
          </div>
          <Link
            to="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors group"
          >
            View all
            <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {currentProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Mobile "View all" link */}
            <div className="sm:hidden mt-6 text-center">
              <Link to="/products" className="btn-primary text-sm">
                View All Products
              </Link>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </section>

      {/* ===== CTA Banner ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-500 to-accent-600 px-8 py-14 sm:px-14 sm:py-16 text-center">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white transform -translate-x-1/3 translate-y-1/3" />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Join SongTor Hub Today
            </h3>
            <p className="text-white/80 text-base sm:text-lg mb-8 max-w-md mx-auto">
              Create an account and get exclusive deals, early access to sales, and personalized recommendations.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-brand-600 font-bold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Create Free Account
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}