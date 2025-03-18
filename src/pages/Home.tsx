import React from "react";
import { useInView } from "react-intersection-observer";
import { ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { articleData } from "./ArticleDetail";

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
    <div className="pt-20">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[80vh] flex items-center bg-gradient-to-r from-primary to-[#009E47]"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683311-eac922347aa1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] mix-blend-overlay opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${
              heroInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Welcome to MTT Official Website
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                One stop portal for all MTT content for all Tflyers
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started
                <ArrowRight className="ml-2" size={20} />
              </Link>
            </div>
            <div className="hidden lg:block">
              <img
                src="/src/assets/images/header.png"
                alt="Digital Experience"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Trusted Section */}
      <section className="mt-14">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by partners and businesses globally
          </h1>
          <p className='class="text-xl text-gray-600 max-w-3xl mx-auto'>
            Powering businesses across the world
          </p>
        </div>
        <div className="grid grid-flow-row grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-5 place-items-center">
        <div className="hidden sm:block"></div>
          {companyData.map((image, index) => (
            <img
              key={index}
              className="w-[159px] h-auto object-contain"
              src={`/src/assets/images/company/${image}`}
              alt={`Company logo ${index + 1}`}
            />
          ))}
          <div className="hidden sm:block"></div>
        </div>
        <div></div>
      </section>
      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Berita terbaru dari MTT
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Berita terbaru dari majelis telkomsel taqwa
            </p>
          </div>
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 ${
              featuresInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {articleData?.slice(0, 3).map((article, index) => (
              <div
                key={index}
                className="bg-white p-0 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className=" overflow-hidden">
                  <img
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-125 hover:shadow-xl"
                    src={article.image}
                  ></img>
                </div>
                <div className="relative p-4 min-h-[330px]">
                  <h3 className="text-[18px] font-bold text-gray-900 mb-4">
                    {article.title}
                  </h3>
                  <div
                    className="mt-4 text-[16px] text-gray-700 leading-relaxed line-clamp-4"
                    dangerouslySetInnerHTML={{ __html: article.news }}
                  />
                  <div className="absolute bottom-0 flex flex-row w-[95%] justify-between items-center mt-2 py-4 pr-4">
                    <div className="flex flex-row items-center">
                      <Calendar width={14} className="text-gray-600 mr-1" />
                      <h2 className="text-[16px] text-gray-600 leading-relaxed line-clamp-4">
                        {article?.created}
                      </h2>
                    </div>
                    <Link
                      to={`/articles/${article.id}`}
                      className="inline-flex items-center bg-tertiary1 text-white px-8 py-3 rounded-full font-semibold transition-colors"
                    >
                      Selengkapnya
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-row justify-center items-center mt-12">
            <Link
              to={`/articles`}
              className="inline-flex items-center bg-tertiary2 text-tertiary3 px-8 py-3 rounded-full font-semibold transition-colors"
            >
              Lihat berita lainnya
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Ready to Get Started?
          </h2>
          <Link
            to="/contact"
            className="inline-flex items-center bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Us
            <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
