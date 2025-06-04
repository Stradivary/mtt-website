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
    }, 6000); // 6 seconds per slide for better mobile experience

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
            animation: slideProgress 6s linear infinite;
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
              padding: 10px;
              min-width: 40px;
              min-height: 40px;
            }
            .slider-control-bottom {
              padding: 8px;
              min-width: 36px;
              min-height: 36px;
            }
          }
          
          /* Improved mobile typography */
          @media (max-width: 640px) {
            .hero-title {
              line-height: 1.1;
              letter-spacing: -0.025em;
            }
            .hero-subtitle {
              line-height: 1.3;
            }
          }
        `}
      </style>
      
      <div className={`full-width-slider relative w-full min-h-[70vh] sm:min-h-[80vh] md:h-[600px] lg:h-[700px] overflow-hidden ${className}`}>
        {/* Main Slider Container */}
        <div className="relative w-full h-full">
          {/* Background with Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${currentSlideData.bgGradient} transition-all duration-500`}>
            <div className="absolute inset-0 bg-black opacity-20"></div>
          </div>

          {/* Slide Content */}
          <div className="relative z-10 flex items-center h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Left Content */}
              <div className={`text-white transition-all duration-500 text-center lg:text-left ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
                {/* Featured Badge */}
                {currentSlideData.featured && (
                  <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-3 sm:mb-4 text-xs sm:text-sm font-medium">
                    <span>🌟 Program Utama</span>
                  </div>
                )}
                
                <h1 className="hero-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 lg:mb-6 leading-tight">
                  {currentSlideData.title}
                </h1>
                
                <p className="hero-subtitle text-lg sm:text-xl md:text-2xl lg:text-3xl mb-3 sm:mb-4 lg:mb-6 opacity-90 font-medium">
                  {currentSlideData.subtitle}
                </p>
                
                <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 lg:mb-10 opacity-80 leading-relaxed max-w-2xl mx-auto lg:max-w-none lg:mx-0 px-2 lg:px-0">
                  {currentSlideData.description}
                </p>
                
                <a
                  href={currentSlideData.buttonLink}
                  className="inline-flex items-center bg-white text-gray-900 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-full font-semibold hover:bg-gray-100 active:bg-gray-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm sm:text-base lg:text-lg touch-manipulation"
                >
                  {currentSlideData.buttonText}
                  <ChevronRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
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

          {/* Mobile Image Background Overlay - Enhanced for better visibility */}
          <div className="lg:hidden absolute inset-0 opacity-5 sm:opacity-10 z-0">
            <img
              src={currentSlideData.image}
              alt={currentSlideData.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/30"></div>
          </div>

          {/* Navigation Controls - Improved mobile positioning */}
          <button
            onClick={handlePrevSlide}
            disabled={isTransitioning}
            className="absolute left-3 sm:left-4 lg:left-8 top-1/2 transform -translate-y-1/2 z-20 slider-control bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white rounded-full transition-all duration-300 disabled:opacity-50 touch-manipulation"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </button>

          <button
            onClick={handleNextSlide}
            disabled={isTransitioning}
            className="absolute right-3 sm:right-4 lg:right-8 top-1/2 transform -translate-y-1/2 z-20 slider-control bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white rounded-full transition-all duration-300 disabled:opacity-50 touch-manipulation"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </button>

          {/* Bottom Controls - Enhanced mobile spacing */}
          <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
            {/* Slide Indicators */}
            <div className="flex space-x-1.5 sm:space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-300 touch-manipulation ${
                    index === currentSlide 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/75 active:bg-white/90'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="slider-control-bottom bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white rounded-full transition-all duration-300 touch-manipulation"
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isPlaying ? <Pause className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" /> : <Play className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
            </button>
          </div>

          {/* Slide Counter - Improved mobile positioning */}
          <div className="absolute top-4 sm:top-6 lg:top-8 right-4 sm:right-6 lg:right-8 z-20 bg-white/20 backdrop-blur-sm text-white px-2.5 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-full text-xs sm:text-sm lg:text-base font-medium">
            {currentSlide + 1} / {slides.length}
          </div>

          {/* Progress Bar - Enhanced visibility */}
          <div className="absolute bottom-0 left-0 w-full h-1 sm:h-1.5 bg-white/20 z-10">
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