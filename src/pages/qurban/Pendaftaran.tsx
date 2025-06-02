import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Pendaftaran = () => {
  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link 
            to="/service" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Layanan Qurban
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pendaftaran Qurban 1446H / 2025M
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Daftarkan qurban Anda melalui Majelis Telkomsel Taqwa. 
            Kami akan memastikan qurban Anda disalurkan dengan amanah dan tepat sasaran.
          </p>
        </div>

        {/* Google Form Embed */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <h2 className="text-2xl font-bold text-center">
              Form Pendaftaran Qurban
            </h2>
            <p className="text-center mt-2 text-green-100">
              Silakan isi data dengan lengkap dan benar
            </p>
          </div>
          
          <div className="p-6">
            <div className="w-full flex justify-center">
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSfR_4OF5rqy34zZoJgS7he-CiLP0NmIcHwxe7nqU5J0aXURkg/viewform?embedded=true"
                width="100%"
                height="800"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                title="Form Pendaftaran Qurban MTT"
                className="rounded-lg"
              >
                Loading…
              </iframe>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Jadwal Penting
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <div>
                  <strong>Pendaftaran:</strong> Hingga 31 Mei 2025
                </div>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <div>
                  <strong>Penyembelihan:</strong> 16-19 Juni 2025
                </div>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <div>
                  <strong>Distribusi:</strong> 16-20 Juni 2025
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Informasi Kontak
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li>
                <strong>WhatsApp:</strong> +62 812-3456-7890
              </li>
              <li>
                <strong>Email:</strong> qurban@mtt.or.id
              </li>
              <li>
                <strong>Jam Operasional:</strong> 
                <br />Senin - Jumat: 08:00 - 17:00 WIB
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pendaftaran; 