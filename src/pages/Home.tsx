import React from 'react';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Globe, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { ref: heroRef, inView: heroInView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  const { ref: featuresRef, inView: featuresInView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[80vh] flex items-center bg-gradient-to-r from-[#00B14F] to-[#009E47]"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683311-eac922347aa1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] mix-blend-overlay opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${
              heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Transform Your Digital Experience
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Create stunning web experiences with modern technologies and innovative solutions.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center bg-white text-[#00B14F] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started
                <ArrowRight className="ml-2" size={20} />
              </Link>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Digital Experience"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="py-20 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine cutting-edge technology with creative excellence to deliver exceptional results.
            </p>
          </div>
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 ${
              featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {[
              {
                icon: <Globe className="w-12 h-12 text-[#00B14F]" />,
                title: 'Global Reach',
                description: 'Connect with audiences worldwide through our innovative solutions',
              },
              {
                icon: <Zap className="w-12 h-12 text-[#00B14F]" />,
                title: 'Lightning Fast',
                description: 'Experience blazing-fast performance and responsive design',
              },
              {
                icon: <Shield className="w-12 h-12 text-[#00B14F]" />,
                title: 'Secure & Reliable',
                description: 'Your data is protected with enterprise-grade security',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#00B14F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Ready to Get Started?
          </h2>
          <Link
            to="/contact"
            className="inline-flex items-center bg-white text-[#00B14F] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
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