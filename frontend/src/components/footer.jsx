import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLine, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: "All Products", href: "/products" },
      { name: "Men", href: "/products/men" },
      { name: "Women", href: "/products/women" },
      { name: "New Arrivals", href: "/products" },
    ],
    support: [
      { name: "Contact Us", href: "/contact" },
      { name: "Order Status", href: "/Orderstatus" },
      { name: "Shipping Info", href: "/services" },
      { name: "FAQ", href: "/contact" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Services", href: "/services" },
      { name: "Privacy Policy", href: "/privacy-policy" },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
              <span className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors">
                SongTor Hub
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-xs">
              ซื้อง่าย ขายไว ปลอดภัยทุกการส่งต่อ
            </p>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Your trusted online marketplace for premium products with fast, secure delivery.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-5">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-brand-500 hover:text-white transition-all duration-200" aria-label="Facebook">
                <FaFacebookF size={14} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-gradient-to-tr hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-200" aria-label="Instagram">
                <FaInstagram size={15} />
              </a>
              <a href="https://line.me" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-green-500 hover:text-white transition-all duration-200" aria-label="Line">
                <FaLine size={15} />
              </a>
              <a href="mailto:support@songtorhub.com" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-brand-500 hover:text-white transition-all duration-200" aria-label="Email">
                <FaEnvelope size={14} />
              </a>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-gray-400 hover:text-brand-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-gray-400 hover:text-brand-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-gray-400 hover:text-brand-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} <span className="text-gray-400">SongTor Hub</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy-policy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/services" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
