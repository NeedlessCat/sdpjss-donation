import React from "react";
import { Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Team from "./pages/Team";
import HelpButton from "./components/HelpButton";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MyProfile from "./pages/MyProfile";
import MyDonations from "./pages/MyDonations";

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/team" element={<Team />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/my-donation" element={<MyDonations />} />
      </Routes>
      <Footer />

      {/* Help Button */}
      <HelpButton />
    </div>
  );
};

export default App;
