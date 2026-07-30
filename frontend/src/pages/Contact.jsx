import React from "react";
import bg2 from "../components/bg/bg2.jpg";
import { FiMail, FiMessageSquare, FiSend, FiMapPin, FiPhone } from "react-icons/fi";

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("ขอบคุณสำหรับการติดต่อ ทีมงานจะตอบกลับโดยเร็วที่สุด");
  };

  return (
    <div className="page-container pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gray-900 py-20 sm:py-28">
        <img src={bg2} alt="Contact Hero" className="absolute inset-0 w-full h-full object-cover object-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/80 to-accent-600/80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl drop-shadow-md">
            Contact Us
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/90 max-w-xl mx-auto drop-shadow">
            Have questions or feedback? We're here to help you anytime.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Get in Touch</h3>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 text-brand-500">
                  <FiMail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Us</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">support@songtorhub.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 text-brand-500">
                  <FiPhone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Call Support</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">+66 (0) 2 123 4567</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 text-brand-500">
                  <FiMapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Office</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">Bangkok, Thailand</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
              <p className="text-sm text-gray-500 mb-6">Fill out the form below and our team will get back to you shortly.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Your Email
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      id="email"
                      className="input-field text-sm !pl-10 !py-2.5"
                      placeholder="name@gmail.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Subject
                  </label>
                  <div className="relative">
                    <FiMessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      id="subject"
                      className="input-field text-sm !pl-10 !py-2.5"
                      placeholder="How can we help you?"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="input-field text-sm !py-2.5"
                    placeholder="Leave your comments or questions..."
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full sm:w-auto inline-flex items-center gap-2 !px-8 !py-3 text-sm font-semibold"
                >
                  <FiSend className="w-4 h-4" /> Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
