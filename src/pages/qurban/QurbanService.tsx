import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BarChart3, Upload, ArrowRight } from 'lucide-react';

const QurbanService = () => {
  const services = [
    {
      title: 'Pendaftaran Qurban',
      description: 'Daftarkan qurban Anda untuk tahun ini dengan mudah dan cepat',
      icon: Users,
      link: '/service/qurban/pendaftaran',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
    {
      title: 'Dashboard Qurban',
      description: 'Lihat statistik dan peta distribusi qurban secara real-time',
      icon: BarChart3,
      link: '/service/qurban/dashboard',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      title: 'Upload Data',
      description: 'Upload data muzakki dan distribusi qurban (Khusus Mitra)',
      icon: Upload,
      link: '/service/qurban/upload',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700'
    }
  ];

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Layanan Qurban MTT
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Majelis Telkomsel Taqwa menyediakan berbagai layanan untuk mendukung 
            pelaksanaan qurban yang amanah dan transparan
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Link
                key={index}
                to={service.link}
                className="group block"
              >
                <div className={`
                  relative overflow-hidden rounded-2xl bg-gradient-to-br ${service.color} 
                  ${service.hoverColor} transition-all duration-300 transform 
                  hover:scale-105 hover:shadow-2xl shadow-lg
                `}>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  
                  <div className="relative p-8 text-white">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <IconComponent className="w-8 h-8" />
                      </div>
                      <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4">
                      {service.title}
                    </h3>
                    
                    <p className="text-white/90 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  
                  {/* Decorative element */}
                  <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full transform group-hover:scale-110 transition-transform duration-300"></div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Tentang Layanan Qurban MTT
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Majelis Telkomsel Taqwa berkomitmen untuk menyelenggarakan ibadah qurban 
              yang amanah, transparan, dan tepat sasaran. Melalui sistem digital yang 
              terintegrasi, kami memastikan setiap hewan qurban didistribusikan kepada 
              yang berhak menerimanya dengan dokumentasi yang lengkap.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QurbanService; 