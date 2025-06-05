import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/articles", label: "Articles" },
  { path: "/service", label: "Service" },
  { path: "/contact", label: "Contact Us" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  // Close mobile menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) setIsOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  // Prevent click event from bubbling up when clicking on navbar
  const handleNavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full z-50" onClick={handleNavClick}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary" onClick={() => setIsOpen(false)}>
              <img className="w-[120px] sm:w-[150px] mt-1 sm:mt-2" src="/assets/logo/logo.png" alt="MTT Logo" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 lg:px-6 py-2 rounded-full transition-all duration-300 font-medium ${
                  location.pathname === path
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-600 hover:text-primary hover:bg-gray-50"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-primary p-2 rounded-full hover:bg-gray-50 transition-all duration-300 touch-manipulation"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div className="md:hidden fixed inset-0 top-16 sm:top-20 bg-black bg-opacity-50 z-40">
            <div className="bg-white shadow-xl">
              <div className="px-4 py-4 space-y-1">
                {navLinks.map(({ path, label }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`block px-4 py-3 rounded-lg transition-all duration-300 touch-manipulation font-medium ${
                      location.pathname === path
                        ? "bg-primary text-white"
                        : path === "/service" || path === "/contact"
                        ? "bg-gray-50 text-primary hover:bg-primary hover:text-white"
                        : "text-gray-600 hover:text-primary hover:bg-gray-50"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
              
              {/* Quick Actions Section for Mobile - Updated */}
              <div className="border-t border-gray-100 px-4 py-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Quick Access
                </div>
                <div className="space-y-2">
                  <Link
                    to="/service/qurban/dashboard"
                    className="flex items-center justify-center bg-green-600 text-white px-4 py-3 rounded-full font-semibold hover:bg-green-700 transition-all duration-300 shadow-md touch-manipulation"
                    onClick={() => setIsOpen(false)}
                  >
                    📊 Dashboard Qurban
                  </Link>
                  <Link
                    to="/service/qurban/dashboard"
                    className="flex items-center justify-center bg-blue-600 text-white px-4 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 shadow-md touch-manipulation"
                    onClick={() => setIsOpen(false)}
                  >
                    🗺️ Pantau Distribusi
                  </Link>
                </div>
                
                {/* Registration closed notice */}
                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800 text-center">
                    Program Qurban 1446H - Pendaftaran Ditutup
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
