import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import Contact from "./pages/Contact";
import Service from "./pages/Service";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import FloatingActionButton from "./components/FloatingActionButton";

// New Qurban Components
import QurbanService from "./pages/qurban/QurbanService";
import Pendaftaran from "./pages/qurban/Pendaftaran";
import Dashboard from "./pages/qurban/Dashboard";
import Upload from "./pages/qurban/Upload";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <ScrollToTop />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route path="/service" element={<QurbanService />} />
            <Route path="/service/qurban/pendaftaran" element={<Pendaftaran />} />
            <Route path="/service/qurban/dashboard" element={<Dashboard />} />
            <Route path="/service/qurban/upload" element={<Upload />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
        <FloatingActionButton />
      </div>
    </Router>
  );
}

export default App;
