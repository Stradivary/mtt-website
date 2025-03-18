import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="bg-white shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-[#00B14F]">
              ParallaxCo
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-[#00B14F] transition-colors">Home</Link>
            <Link to="/articles" className="text-gray-600 hover:text-[#00B14F] transition-colors">Articles</Link>
            <Link 
              to="/contact" 
              className="bg-[#00B14F] text-white px-6 py-2 rounded-full hover:bg-[#009E47] transition-colors"
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-[#00B14F]"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <Link
                to="/"
                className="block px-3 py-2 text-gray-600 hover:text-[#00B14F] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/articles"
                className="block px-3 py-2 text-gray-600 hover:text-[#00B14F] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Articles
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 bg-[#00B14F] text-white rounded-full text-center hover:bg-[#009E47] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact Us
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;