import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X } from 'lucide-react';

const FloatingActionButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsExpanded(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-4 z-50 md:hidden">
      {/* Background overlay when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Action items */}
      <div className={`mb-4 transform transition-all duration-300 ${
        isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      }`}>
        <div className="flex flex-col space-y-3">
          {/* Qurban Registration */}
          <Link
            to="/service/qurban/pendaftaran"
            className="flex items-center bg-green-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 touch-manipulation group"
            onClick={() => setIsExpanded(false)}
          >
            <span className="text-lg mr-2">🕌</span>
            <span className="font-semibold text-sm whitespace-nowrap">Daftar Qurban</span>
          </Link>
          
          {/* Dashboard */}
          <Link
            to="/service/qurban/dashboard"
            className="flex items-center bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 touch-manipulation group"
            onClick={() => setIsExpanded(false)}
          >
            <span className="text-lg mr-2">📊</span>
            <span className="font-semibold text-sm whitespace-nowrap">Dashboard</span>
          </Link>
        </div>
      </div>
      
      {/* Main FAB button */}
      <button
        onClick={toggleExpanded}
        className="bg-primary text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center touch-manipulation group"
        aria-label={isExpanded ? "Close menu" : "Open quick actions"}
      >
        <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-45' : 'rotate-0'}`}>
          {isExpanded ? <X size={24} /> : <Plus size={24} />}
        </div>
      </button>
      
      {/* Pulse animation when not expanded */}
      {!isExpanded && (
        <div className="absolute inset-0 rounded-full bg-primary opacity-20 animate-ping" />
      )}
    </div>
  );
};

export default FloatingActionButton; 