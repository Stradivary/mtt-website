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
      description: 'Pantau perkembangan distribusi qurban Majelis Telkomsel Taqwa secara real-time dengan data lengkap dan transparan.',
      buttonText: 'Lihat Dashboard',
      buttonLink: '/service/qurban/dashboard',
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
          
          /* Mobile image optimization */
          @media (max-width: 768px) {
            .mobile-image-container {
              min-height: 40vh;
              max-height: 60vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #f8fafc;
            }
            .mobile-image {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
              object-position: center;
            }
          }
          
          /* Desktop image optimization - Apple-like design without cropping */
          @media (min-width: 1024px) {
            .desktop-image-container {
              position: relative;
              padding: 10px;
              perspective: 1000px;
              width: 100%;
              height: auto;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .desktop-image {
              width: 100%;
              height: auto;
              max-height: 70vh;
              border-radius: 20px;
              box-shadow: 
                0 20px 40px -12px rgba(0, 0, 0, 0.25),
                0 8px 16px -5px rgba(0, 0, 0, 0.1),
                0 0 0 1px rgba(255, 255, 255, 0.1);
              transform: perspective(1000px) rotateY(-3deg) rotateX(1deg);
              transition: all 0.5s ease;
              object-fit: contain;
              object-position: center;
            }
            .desktop-image:hover {
              transform: perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1.02);
              box-shadow: 
                0 25px 50px -12px rgba(0, 0, 0, 0.3),
                0 12px 20px -5px rgba(0, 0, 0, 0.15),
                0 0 0 1px rgba(255, 255, 255, 0.15);
            }
            
            /* Enhanced container for better spacing */
            .desktop-content-container {
              padding-right: 1.5rem;
            }
            
            /* Improve image aspect ratio for larger screens */
            @media (min-width: 1280px) {
              .desktop-image-container {
                padding: 15px;
              }
              .desktop-image {
                border-radius: 24px;
                max-height: 75vh;
              }
            }
            
            @media (min-width: 1536px) {
              .desktop-image {
                max-height: 80vh;
                border-radius: 28px;
              }
            }
          }
        `}
      </style>
      
      <div className={`full-width-slider relative w-full h-auto overflow-hidden ${className}`}>
        {/* Main Slider Container */}
        <div className="relative w-full h-full">
          {/* Mobile Layout - Stacked Image and Content */}
          <div className="lg:hidden">
            {/* Mobile Image Section - Optimized for full image visibility */}
            <div className="mobile-image-container relative w-full overflow-hidden">
              <img
                src={currentSlideData.image}
                alt={currentSlideData.title}
                className="mobile-image w-full h-full"
              />
              {/* Subtle gradient overlay for better control visibility */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20"></div>
              
              {/* Mobile Navigation Controls */}
              <button
                onClick={handlePrevSlide}
                disabled={isTransitioning}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 z-20 slider-control bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white rounded-full transition-all duration-300 disabled:opacity-50 touch-manipulation"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNextSlide}
                disabled={isTransitioning}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 z-20 slider-control bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white rounded-full transition-all duration-300 disabled:opacity-50 touch-manipulation"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Mobile Slide Counter */}
              <div className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium">
                {currentSlide + 1} / {slides.length}
              </div>

              {/* Featured Badge on Image */}
              {currentSlideData.featured && (
                <div className="absolute top-4 left-4 z-20 inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-white">
                  <span>🌟 Program Utama</span>
                </div>
              )}
            </div>

            {/* Mobile Content Section - Below Image */}
            <div className={`bg-gradient-to-r ${currentSlideData.bgGradient} text-white px-4 py-6 sm:py-8 transition-all duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <div className="max-w-lg mx-auto text-center">
                <h1 className="hero-title text-xl sm:text-2xl md:text-3xl font-bold mb-3 leading-tight">
                  {currentSlideData.title}
                </h1>
                
                <p className="hero-subtitle text-base sm:text-lg md:text-xl mb-3 opacity-90 font-medium">
                  {currentSlideData.subtitle}
                </p>
                
                <p className="text-sm sm:text-base mb-6 opacity-80 leading-relaxed">
                  {currentSlideData.description}
                </p>
                
                <a
                  href={currentSlideData.buttonLink}
                  className="inline-flex items-center bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 active:bg-gray-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm touch-manipulation"
                >
                  {currentSlideData.buttonText}
                  <ChevronRight className="ml-2 w-4 h-4" />
                </a>
              </div>

              {/* Mobile Bottom Controls */}
              <div className="flex items-center justify-center mt-6 space-x-4">
                {/* Slide Indicators */}
                <div className="flex space-x-1.5">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 touch-manipulation ${
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
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Mobile Progress Bar */}
            <div className="w-full h-1 bg-white/20">
              <div 
                key={progressKey}
                className={`h-full transition-all duration-300 ${
                  isPlaying ? 'progress-animate bg-white' : 'w-0 bg-white'
                }`}
                style={{ background: `linear-gradient(to right, ${currentSlideData.bgGradient.replace('from-', '').replace('to-', ', ')})` }}
              />
            </div>
          </div>

          {/* Desktop Layout - Side by Side with Full Image Visibility */}
          <div className="hidden lg:block">
            {/* Background with Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${currentSlideData.bgGradient} transition-all duration-500`}>
              <div className="absolute inset-0 bg-black opacity-20"></div>
            </div>

            {/* Slide Content */}
            <div className="relative z-10 flex items-center h-full min-h-[85vh] xl:min-h-[90vh] py-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-center w-full max-w-7xl mx-auto px-4 lg:px-6">
                {/* Left Content - Takes up 4 columns */}
                <div className={`lg:col-span-4 desktop-content-container text-white transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
                  {/* Featured Badge */}
                  {currentSlideData.featured && (
                    <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-sm font-medium">
                      <span>🌟 Program Utama</span>
                    </div>
                  )}
                  
                  <h1 className="hero-title text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-6 leading-tight">
                    {currentSlideData.title}
                  </h1>
                  
                  <p className="hero-subtitle text-lg xl:text-xl 2xl:text-2xl mb-6 opacity-90 font-medium">
                    {currentSlideData.subtitle}
                  </p>
                  
                  <p className="text-base xl:text-lg mb-8 opacity-80 leading-relaxed">
                    {currentSlideData.description}
                  </p>
                  
                  <a
                    href={currentSlideData.buttonLink}
                    className="inline-flex items-center bg-white text-gray-900 px-6 xl:px-8 py-3 xl:py-4 rounded-full font-semibold hover:bg-gray-100 active:bg-gray-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-base xl:text-lg touch-manipulation"
                  >
                    {currentSlideData.buttonText}
                    <ChevronRight className="ml-2 w-5 h-5 xl:w-6 xl:h-6" />
                  </a>
                </div>

                {/* Right Image - Takes up 8 columns, full image visibility */}
                <div className={`lg:col-span-8 transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                  <div className="desktop-image-container">
                    <img
                      src={currentSlideData.image}
                      alt={currentSlideData.title}
                      className="desktop-image w-full h-auto"
                    />
                    {/* Image overlay for featured slide */}
                    {currentSlideData.featured && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 rounded-full p-3 shadow-xl z-10">
                        <span className="text-2xl">🕌</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Controls */}
            <button
              onClick={handlePrevSlide}
              disabled={isTransitioning}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white p-3 rounded-full transition-all duration-300 disabled:opacity-50 touch-manipulation"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNextSlide}
              disabled={isTransitioning}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white p-3 rounded-full transition-all duration-300 disabled:opacity-50 touch-manipulation"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Desktop Bottom Controls */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-6">
              {/* Slide Indicators */}
              <div className="flex space-x-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-4 h-4 rounded-full transition-all duration-300 touch-manipulation ${
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
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white p-3 rounded-full transition-all duration-300 touch-manipulation"
                aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
            </div>

            {/* Desktop Slide Counter */}
            <div className="absolute top-8 right-8 z-20 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-base font-medium">
              {currentSlide + 1} / {slides.length}
            </div>

            {/* Desktop Progress Bar */}
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
      </div>
    </>
  );
};

export default HeaderSlider; 