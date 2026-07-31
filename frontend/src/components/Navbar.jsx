import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  ShoppingBagIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import logo from "./logo/weblogo.jpg";

const navigation = {
  categories: [
    { id: "men", name: "Men", href: "/products/men" },
    { id: "women", name: "Women", href: "/products/women" },
  ],
  pages: [
    { name: "Stores", href: "/Products" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],
};

export default function Navbar({
  isLoggedIn,
  userData,
  selectedProducts,
  setDropdownOpen,
  dropdownOpen,
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileImage =
    "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg";

  const handleLogout = () => {
    localStorage.removeItem("token");
  };

  // Sticky navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownOpen && !e.target.closest('[data-profile-menu]')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen, setDropdownOpen]);

  return (
    <div className="bg-white">
      {/* Mobile menu */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white pb-12 shadow-2xl z-50">
                {/* Mobile menu header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <img className="h-8 w-auto rounded-lg" src={logo} alt="SongTor Hub" />
                    <span className="font-bold text-lg text-gray-900">SongTor Hub</span>
                  </div>
                  <button
                    type="button"
                    className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                {/* Mobile category links */}
                <div className="space-y-1 px-4 py-4">
                  <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
                  {navigation.categories.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>

                {/* Mobile page links */}
                <div className="space-y-1 border-t border-gray-100 px-4 py-4">
                  <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pages</p>
                  {navigation.pages.map((page) => (
                    <a
                      key={page.name}
                      href={page.href}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      {page.name}
                    </a>
                  ))}
                </div>

                {/* Mobile auth section */}
                <div className="mt-auto border-t border-gray-100 px-4 py-4">
                  {isLoggedIn ? (
                    <>
                      {userData && (
                        <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-gray-50 rounded-xl">
                          <img src={profileImage} alt="Profile" className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-100" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{userData.fname} {userData.lname}</p>
                            <p className="text-xs text-gray-500">Member</p>
                          </div>
                        </div>
                      )}
                      <a href="/Orderstatus" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setOpen(false)}>
                        <ClipboardDocumentListIcon className="h-5 w-5 text-gray-400" /> Order Status
                      </a>
                      <a href="/SettingUser" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setOpen(false)}>
                        <Cog6ToothIcon className="h-5 w-5 text-gray-400" /> Settings
                      </a>
                      <a href="/" onClick={handleLogout} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                        <ArrowRightOnRectangleIcon className="h-5 w-5" /> Logout
                      </a>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <a href="/login" className="btn-primary w-full text-center text-sm" onClick={() => setOpen(false)}>
                        Sign in
                      </a>
                      <a href="/register" className="btn-ghost w-full text-center text-sm border border-gray-200 rounded-xl" onClick={() => setOpen(false)}>
                        Create account
                      </a>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop header */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled 
          ? "bg-white/95 backdrop-blur-md shadow-md" 
          : "bg-white"
      }`}>
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-500 via-brand-400 to-accent-500" />
        
        <nav aria-label="Top" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            {/* Mobile hamburger */}
            <button
              type="button"
              className="rounded-lg p-2 text-gray-500 hover:text-brand-500 hover:bg-brand-50 transition-colors lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Logo */}
            <div className="ml-3 flex items-center gap-3 lg:ml-0">
              <Link to="/" className="flex items-center gap-2.5 group">
                <img className="h-9 w-auto rounded-lg shadow-sm group-hover:shadow-md transition-shadow" src={logo} alt="SongTor Hub" />
                <div className="hidden sm:block">
                  <span className="text-lg font-bold text-gray-900 group-hover:text-brand-500 transition-colors">
                    SongTor Hub
                  </span>
                  <span className="hidden lg:block text-[10px] text-gray-400 leading-tight -mt-0.5">
                    ซื้อง่าย ขายไว ปลอดภัยทุกการส่งต่อ
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop navigation links */}
            <div className="hidden lg:ml-10 lg:block lg:self-stretch">
              <div className="flex h-full space-x-1">
                {navigation.categories.map((category) => (
                  <a
                    key={category.name}
                    href={category.href}
                    className="relative flex items-center px-4 text-sm font-medium text-gray-600 hover:text-brand-500 transition-colors group"
                  >
                    {category.name}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brand-500 rounded-full transition-all duration-300 group-hover:w-3/4" />
                  </a>
                ))}
                {navigation.pages.map((page) => (
                  <a
                    key={page.name}
                    href={page.href}
                    className="relative flex items-center px-4 text-sm font-medium text-gray-600 hover:text-brand-500 transition-colors group"
                  >
                    {page.name}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brand-500 rounded-full transition-all duration-300 group-hover:w-3/4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Right side: auth + cart */}
            <div className="ml-auto flex items-center gap-2">
              {isLoggedIn ? (
                <div className="hidden lg:flex items-center" data-profile-menu>
                  {userData && (
                    <div className="relative flex items-center gap-3">
                      <button
                        type="button"
                        className="flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 hover:bg-gray-50 transition-colors"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                      >
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-100"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {userData.fname}
                        </span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Profile dropdown */}
                      {dropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 py-2 animate-fade-in">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-900">{userData.fname} {userData.lname}</p>
                            <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                          </div>
                          <a href="/Orderstatus" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                            <ClipboardDocumentListIcon className="h-4 w-4 text-gray-400" /> Order Status
                          </a>
                          <a href="/SettingUser" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                            <Cog6ToothIcon className="h-4 w-4 text-gray-400" /> Settings
                          </a>
                          <div className="border-t border-gray-100 mt-1 pt-1">
                            <a href="/" onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                              <ArrowRightOnRectangleIcon className="h-4 w-4" /> Logout
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-3">
                  <a href="/login" className="text-sm font-medium text-gray-600 hover:text-brand-500 transition-colors px-3 py-2">
                    Sign in
                  </a>
                  <a href="/register" className="btn-primary text-sm !py-2 !px-5 !rounded-lg">
                    Create account
                  </a>
                </div>
              )}

              {/* Cart */}
              <Link to="/cart" className="relative group flex items-center gap-1.5 p-2 rounded-xl hover:bg-brand-50 transition-colors ml-1">
                <ShoppingBagIcon className="h-6 w-6 text-gray-500 group-hover:text-brand-500 transition-colors" aria-hidden="true" />
                {selectedProducts.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white rounded-full bg-brand-500 ring-2 ring-white">
                    {selectedProducts.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}