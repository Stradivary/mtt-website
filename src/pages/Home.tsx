import React from "react";
import { useInView } from "react-intersection-observer";
import { ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { articleData } from "./ArticleDetail";
import HeaderSlider from "../components/HeaderSlider";

const Home = () => {
  const { ref: heroRef, inView: heroInView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  const { ref: featuresRef, inView: featuresInView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  const companyData = [
    "telkomsel.png",
    "dream-tour.png",
    "tunas-tours.png",
    "rumah-zakat.png",
  ];

  return (
    <div className="pt-16 sm:pt-20">
      {/* Full Width Hero Section with Auto Slider */}
      <section
        ref={heroRef}
        className="w-full bg-gray-50"
      >
        {/* Full Width Container - No horizontal padding */}
        <div className="w-full">
          <div
            className={`transition-all duration-1000 ${
              heroInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {/* Auto Header Slider - Full Width */}
            <HeaderSlider className="" />
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section - Mobile Optimized */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Layanan Utama MTT
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Portal terpadu untuk semua kebutuhan layanan Majelis Telkomsel Taqwa
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* Program Qurban Card - Mobile Enhanced */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95">
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative p-6 sm:p-8 text-white">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl">🕌</span>
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Program Qurban</h3>
                <p className="text-white/90 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  Qurban amanah & transparan bersama MTT. Disalurkan dengan sistem yang terpercaya dan tepat sasaran.
                </p>
                
                <Link
                  to="/service/qurban/pendaftaran"
                  className="inline-flex items-center bg-white text-green-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg text-sm sm:text-base touch-manipulation"
                >
                  Daftar Sekarang
                  <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 sm:w-32 sm:h-32 bg-white/5 rounded-full"></div>
            </div>

            {/* Dashboard Card - Mobile Enhanced */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95">
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative p-6 sm:p-8 text-white">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl">📊</span>
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Dashboard</h3>
                <p className="text-white/90 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  Monitoring distribusi real-time dengan peta interaktif dan analisis data lengkap.
                </p>
                
                <Link
                  to="/service/qurban/dashboard"
                  className="inline-flex items-center bg-white text-blue-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg text-sm sm:text-base touch-manipulation"
                >
                  Lihat Dashboard
                  <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 sm:w-32 sm:h-32 bg-white/5 rounded-full"></div>
            </div>

            {/* Layanan MTT Card - Mobile Enhanced */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95">
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative p-6 sm:p-8 text-white">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl">📱</span>
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Layanan MTT</h3>
                <p className="text-white/90 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  Portal lengkap layanan Tflyers dengan berbagai fitur untuk keluarga besar Telkomsel.
                </p>
                
                <Link
                  to="/service"
                  className="inline-flex items-center bg-white text-purple-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg text-sm sm:text-base touch-manipulation"
                >
                  Jelajahi Layanan
                  <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 sm:w-32 sm:h-32 bg-white/5 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Section - Mobile Optimized */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Trusted by partners and businesses globally
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Powering businesses across the world
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-8 items-center justify-items-center">
            {companyData.map((image, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300 w-full">
                <img
                  className="w-full h-12 sm:h-16 object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  src={`/assets/images/company/${image}`}
                  alt={`Company logo ${index + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Mobile Enhanced */}
      <section ref={featuresRef} className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Berita terbaru dari MTT
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Berita terbaru dari majelis telkomsel taqwa
            </p>
          </div>
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 transition-all duration-1000 ${
              featuresInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {articleData?.slice(0, 3).map((article, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <div className="overflow-hidden">
                  <img
                    className="w-full h-40 sm:h-48 object-cover transition-transform duration-300 hover:scale-110"
                    src={article.image}
                    alt={article.title}
                  />
                </div>
                <div className="relative p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 line-clamp-2">
                    {article.title}
                  </h3>
                  <div
                    className="text-gray-700 leading-relaxed line-clamp-3 mb-4 sm:mb-6 text-sm sm:text-base"
                    dangerouslySetInnerHTML={{ __html: article.news }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span>{article?.created}</span>
                    </div>
                    <Link
                      to={`/articles/${article.id}`}
                      className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm transition-colors touch-manipulation"
                    >
                      Selengkapnya
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 sm:mt-12">
            <Link
              to="/articles"
              className="inline-flex items-center bg-white text-green-600 border-2 border-green-600 hover:bg-green-600 hover:text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold transition-all duration-300 text-sm sm:text-base touch-manipulation"
            >
              Lihat berita lainnya
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section - Mobile Focused */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-green-600 to-emerald-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 px-2">
              Bergabunglah dengan keluarga besar MTT dan nikmati berbagai layanan untuk Tflyers
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
              <Link
                to="/service/qurban/pendaftaran"
                className="inline-flex items-center justify-center bg-white text-green-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base touch-manipulation"
              >
                Daftar Qurban
                <span className="ml-2">🕌</span>
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:bg-white hover:text-green-600 transition-all duration-300 text-sm sm:text-base touch-manipulation"
              >
                Contact Us
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
