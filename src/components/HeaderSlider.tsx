import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface HeaderSliderProps {
  className?: string;
}

const HeaderSlider: React.FC<HeaderSliderProps> = ({ className = '' }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  // Header slides data - Qurban header sebagai yang utama (pertama)
  const slides = [
    {
      id: 1,
      image: '/assets/images/header_qurban.png',
      title: 'Qurban Bersama MTT 1446H',
      subtitle: 'Program Qurban Amanah & Transparan untuk Ummat',
      description: 'Bergabunglah dengan program qurban Majelis Telkomsel Taqwa. Disalurkan dengan amanah dan tepat sasaran.',
      buttonText: 'Daftar Qurban',
      buttonLink: '/service/qurban/pendaftaran',
      bgGradient: 'from-green-600 to-emerald-700',
      featured: true // Mark as featured/primary
    },
    {
      id: 2,
      image: '/assets/images/header.png',
      title: 'Welcome to MTT Official Website',
      subtitle: 'One stop portal for all MTT content for all Tflyers',
      description: 'Majelis Telkomsel Taqwa - Portal resmi untuk semua konten dan layanan bagi keluarga besar Telkomsel.',
      buttonText: 'Get Started',
      buttonLink: '/service',
      bgGradient: 'from-primary to-[#009E47]',
      featured: false
    }
  ];

  // Navigation functions with useCallback to prevent unnecessary re-renders
  const handleNextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setProgressKey(prev => prev + 1);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, slides.length]);

  const handlePrevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setProgressKey(prev => prev + 1);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, slides.length]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setProgressKey(prev => prev + 1);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, currentSlide]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
    setProgressKey(prev => prev + 1);
  }, [isPlaying]);

  // Auto-slide functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      handleNextSlide();
    }, 5000); // 5 seconds per slide

    return () => clearInterval(interval);
  }, [isPlaying, handleNextSlide]);

  const currentSlideData = slides[currentSlide];

  return (
    <>
      {/* Global CSS for animation */}
      <style>
        {`
          @keyframes slideProgress {
            from { width: 0%; }
            to { width: 100%; }
          }
          .progress-animate {
            animation: slideProgress 5s linear infinite;
          }
          
          /* Ensure full width */
          .full-width-slider {
            margin-left: calc(-50vw + 50%);
            margin-right: calc(-50vw + 50%);
            width: 100vw;
          }
          
          /* Touch-friendly buttons */
          @media (max-width: 768px) {
            .slider-control {
              padding: 12px;
              min-width: 44px;
              min-height: 44px;
            }
          }
        `}
      </style>
      
      <div className={`full-width-slider relative w-full min-h-[80vh] md:h-[600px] lg:h-[700px] overflow-hidden ${className}`}>
        {/* Main Slider Container */}
        <div className="relative w-full h-full">
          {/* Background with Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${currentSlideData.bgGradient} transition-all duration-500`}>
            <div className="absolute inset-0 bg-black opacity-20"></div>
          </div>

          {/* Slide Content */}
          <div className="relative z-10 flex items-center h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Left Content */}
              <div className={`text-white transition-all duration-500 text-center lg:text-left ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
                {/* Featured Badge */}
                {currentSlideData.featured && (
                  <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4 text-sm font-medium">
                    <span>🌟 Program Utama</span>
                  </div>
                )}
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 lg:mb-6 leading-tight">
                  {currentSlideData.title}
                </h1>
                
                <p className="text-xl sm:text-2xl lg:text-3xl mb-4 lg:mb-6 opacity-90 font-medium">
                  {currentSlideData.subtitle}
                </p>
                
                <p className="text-base sm:text-lg lg:text-xl mb-8 lg:mb-10 opacity-80 leading-relaxed max-w-2xl mx-auto lg:max-w-none lg:mx-0">
                  {currentSlideData.description}
                </p>
                
                <a
                  href={currentSlideData.buttonLink}
                  className="inline-flex items-center bg-white text-gray-900 px-8 py-4 lg:px-10 lg:py-5 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-base lg:text-lg"
                >
                  {currentSlideData.buttonText}
                  <ChevronRight className="ml-2 w-5 h-5 lg:w-6 lg:h-6" />
                </a>
              </div>

              {/* Right Image - Hidden on mobile, shown on large screens */}
              <div className={`hidden lg:block transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                <div className="relative">
                  <img
                    src={currentSlideData.image}
                    alt={currentSlideData.title}
                    className="w-full h-auto rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                  />
                  {/* Image overlay for featured slide */}
                  {currentSlideData.featured && (
                    <div className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900 rounded-full p-3 shadow-lg">
                      <span className="text-2xl">🕌</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Image Background Overlay */}
          <div className="lg:hidden absolute inset-0 opacity-10 z-0">
            <img
              src={currentSlideData.image}
              alt={currentSlideData.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Navigation Controls - Fixed positioning and improved click handling */}
          <button
            onClick={handlePrevSlide}
            disabled={isTransitioning}
            className="absolute left-4 lg:left-8 top-1/2 transform -translate-y-1/2 z-20 slider-control bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 lg:p-4 rounded-full transition-all duration-300 disabled:opacity-50 touch-manipulation"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 lg:w-8 lg:h-8" />
          </button>

          <button
            onClick={handleNextSlide}
            disabled={isTransitioning}
            className="absolute right-4 lg:right-8 top-1/2 transform -translate-y-1/2 z-20 slider-control bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 lg:p-4 rounded-full transition-all duration-300 disabled:opacity-50 touch-manipulation"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8" />
          </button>

          {/* Bottom Controls - Enhanced positioning */}
          <div className="absolute bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-4 lg:space-x-6">
            {/* Slide Indicators */}
            <div className="flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-300 touch-manipulation ${
                    index === currentSlide 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 lg:p-3 rounded-full transition-all duration-300 touch-manipulation"
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isPlaying ? <Pause className="w-4 h-4 lg:w-5 lg:h-5" /> : <Play className="w-4 h-4 lg:w-5 lg:h-5" />}
            </button>
          </div>

          {/* Slide Counter */}
          <div className="absolute top-6 lg:top-8 right-6 lg:right-8 z-20 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-sm lg:text-base font-medium">
            {currentSlide + 1} / {slides.length}
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/20 z-10">
            <div 
              key={progressKey}
              className={`h-full bg-white transition-all duration-300 ${
                isPlaying ? 'progress-animate' : 'w-0'
              }`}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderSlider; 