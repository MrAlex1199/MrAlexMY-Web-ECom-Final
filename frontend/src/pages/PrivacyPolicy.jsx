import React from "react";
import bg2 from "../components/bg/bg2.jpg";
import { FiShield } from "react-icons/fi";

export default function PrivacyPolicy() {
  return (
    <div className="page-container pb-16">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gray-900 py-16 sm:py-24">
        <img src={bg2} alt="Privacy Policy" className="absolute inset-0 w-full h-full object-cover object-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/80 to-accent-600/80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white mx-auto mb-4">
            <FiShield className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-white sm:text-5xl drop-shadow-md">
            Privacy Policy
          </h1>
          <p className="mt-2 text-base text-white/90 max-w-xl mx-auto drop-shadow">
            SongTor Hub — Your privacy and data security are our top priorities
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-md border border-gray-100 space-y-8 text-gray-700 leading-relaxed">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Overview</h2>
            <p className="text-sm">
              At SongTor Hub, your privacy is important to us. This privacy policy statement explains the personal data our website processes, how we process it, and for what purposes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Information We Collect</h2>
            <p className="text-sm mb-3">
              We collect information to provide better services to all our users. We collect information in the following ways:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 pl-2">
              <li>
                <strong>Information you provide:</strong> When signing up for an account, we ask for personal details like your full name, email address, shipping address, and phone number.
              </li>
              <li>
                <strong>Usage information:</strong> We collect data regarding the services you use, order history, and how you interact with our marketplace.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">How We Use Information</h2>
            <p className="text-sm text-gray-600">
              We use collected information to maintain and improve our marketplace, process purchases, deliver items securely, and notify users about order status updates.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Information Sharing</h2>
            <p className="text-sm text-gray-600 mb-3">
              We do not share personal information with outside companies or third parties except in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 pl-2">
              <li>With your explicit consent.</li>
              <li>For order fulfillment with verified logistics and delivery partners.</li>
              <li>For legal reasons if required by applicable regulations or governmental request.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Data Security</h2>
            <p className="text-sm text-gray-600">
              We employ encryption and secure authentication protocols to protect user data from unauthorized access, alteration, or disclosure.
            </p>
          </div>

          <div className="pt-6 border-t border-gray-100 text-xs text-gray-400">
            Last updated: July 2026. SongTor Hub reserves the right to update this policy periodically.
          </div>
        </div>
      </div>
    </div>
  );
}
