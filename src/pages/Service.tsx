import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import FormQurban from "../components/FormQurban";

const Contact = () => {
  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bahagiakan Sesama dengan QURBANMU 
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <FormQurban />
        </div>
      </div>
    </div>
  );
};

export default Contact;
