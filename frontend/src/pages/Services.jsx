import React from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiTruck, FiShield, FiTag } from "react-icons/fi";

export default function Services() {
  const services = [
    {
      id: "service1",
      name: "Buyer Protection",
      icon: FiShield,
      price: "Free",
      details: "100% money-back guarantee if items do not match seller description.",
      features: ["Verified Sellers", "Escrow Payments", "Conflict Resolution Support"],
      popular: false,
    },
    {
      id: "service2",
      name: "Express Delivery",
      icon: FiTruck,
      price: "$8.00",
      details: "Fast nationwide doorstep shipping within 2 to 4 business days.",
      features: ["Real-time Tracking", "Doorstep Delivery", "Insured Shipping"],
      popular: true,
    },
    {
      id: "service3",
      name: "Seller Promotion Hub",
      icon: FiTag,
      price: "$19.99",
      details: "Boost your listings to top banner placement and sell 3x faster.",
      features: ["Featured Badge", "Top Search Results", "Weekly Performance Analytics"],
      popular: false,
    },
  ];

  return (
    <div className="page-container pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">
            SongTor Hub Services
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold mt-2 mb-4">
            Services & Solutions for Buyers & Sellers
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
            Choose the service level that best fits your trading and shipping needs
          </p>
        </div>
      </div>

      {/* Service Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className={`rounded-3xl p-8 bg-white border transition-all duration-300 flex flex-col justify-between ${
                  service.popular
                    ? "border-brand-500 shadow-xl ring-2 ring-brand-500/20 relative"
                    : "border-gray-100 shadow-sm hover:shadow-md"
                }`}
              >
                {service.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500 mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6">{service.details}</p>
                  
                  <div className="text-3xl font-extrabold text-gray-900 mb-6">
                    {service.price}
                  </div>

                  <ul className="space-y-3 pt-6 border-t border-gray-100 text-sm">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-700">
                        <FiCheck className="text-emerald-500 w-4 h-4 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to="/contact"
                  className={`mt-8 w-full block text-center font-semibold text-sm py-3 rounded-xl transition-all ${
                    service.popular
                      ? "btn-primary"
                      : "btn-ghost border border-gray-200"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}