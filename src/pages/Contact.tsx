import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import ContactForm from "../components/ContactForm";

const Contact = () => {
  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have a question or want to work together? We'd love to hear from
            you.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex flex-row justify-between">
            {[
              {
                icon: <Mail className="w-8 h-8 text-primary" />,
                title: "Email",
                content: "-",
              },
              {
                icon: <Phone className="w-8 h-8 text-primary" />,
                title: "Phone",
                content: "-",
              },
              {
                icon: <MapPin className="w-8 h-8 text-primary" />,
                title: "Location",
                content: "-",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white min-w-[220px] p-6 rounded-2xl shadow-lg text-center"
              >
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <ContactForm />
        </div>
      </div>
    </div>
  );
};

export default Contact;
