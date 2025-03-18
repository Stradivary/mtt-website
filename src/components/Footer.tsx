import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-[#00B14F]">ParallaxCo</h3>
            <p className="text-gray-400 mb-4">
              Creating beautiful web experiences with modern technologies and innovative solutions.
              We're passionate about delivering exceptional digital experiences.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-[#00B14F] transition-colors">Home</Link></li>
              <li><Link to="/articles" className="text-gray-400 hover:text-[#00B14F] transition-colors">Articles</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-[#00B14F] transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#00B14F] transition-colors">
                <Github size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#00B14F] transition-colors">
                <Twitter size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#00B14F] transition-colors">
                <Linkedin size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">© 2024 ParallaxCo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;