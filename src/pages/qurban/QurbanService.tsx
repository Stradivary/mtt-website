import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BarChart3, Upload, ArrowRight } from 'lucide-react';

const QurbanService = () => {
  const services = [
    {
      title: 'Dashboard Qurban',
      description: 'Lihat data distribusi qurban secara real-time dengan peta interaktif',
      icon: BarChart3,
      link: '/service/qurban/dashboard',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      enabled: true
    },
    {
      title: 'Pendaftaran Qurban',
      description: 'Program Qurban 1446H - Pendaftaran Ditutup',
      icon: Users,
      link: '/service/qurban/dashboard', // Redirect to dashboard
      color: 'from-gray-400 to-gray-500',
      hoverColor: 'hover:from-gray-400 hover:to-gray-500',
      enabled: false,
      closedDate: 'Pendaftaran ditutup sejak 5 Juni 2025'
    },
    {
      title: 'Upload Data',
      description: 'Upload data muzakki dan distribusi qurban (Khusus Mitra)',
      icon: Upload,
      link: '/service/qurban/upload',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      enabled: true
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
          
          {/* Registration closed notice */}
          <div className="mt-8 mx-auto max-w-2xl bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center justify-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📢</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-800">
                  <strong>Program Qurban 1446H - Pendaftaran Ditutup.</strong> Silakan pantau distribusi melalui dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            const isDisabled = !service.enabled;
            
            return (
              <div key={index} className="group block relative">
                {/* Conditional Link Wrapper */}
                {isDisabled ? (
                  <div className="relative cursor-not-allowed">
                    <div className={`
                      relative overflow-hidden rounded-2xl bg-gradient-to-br ${service.color} 
                      transition-all duration-300 shadow-lg opacity-60
                    `}>
                      <div className="relative p-8 text-white">
                        <div className="flex items-center justify-between mb-6">
                          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <IconComponent className="w-8 h-8" />
                          </div>
                          <ArrowRight className="w-6 h-6 opacity-50" />
                        </div>
                        
                        <h3 className="text-2xl font-bold mb-4">
                          {service.title}
                        </h3>
                        
                        <p className="text-white/90 leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                      
                      {/* Decorative element */}
                      <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
                      
                      {/* Overlay for disabled state */}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-center shadow-lg">
                          <div className="font-bold text-lg">PENDAFTARAN DITUTUP</div>
                          {service.closedDate && (
                            <div className="text-sm opacity-90 mt-1">{service.closedDate}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link to={service.link} className="block">
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
                )}
              </div>
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
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">
                📊 Pantau perkembangan distribusi qurban secara real-time melalui dashboard kami.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QurbanService; 