import React from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext } from "react";
import { AdminContext } from "./context/AdminContext";

import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import AddAdmin from "./pages/AddAdmin";
import UserList from "./pages/UserList";
import DonationList from "./pages/DonationList";
import NoticeBoard from "./pages/NoticeBoard";
import ManageTeam from "./pages/ManageTeam";
import ScrollToTop from "./components/ScrollToTop";
import KhandanList from "./pages/KhandanList";
import DonationCategory from "./pages/DonationCategory";
import Receipt from "./pages/Receipt";

const App = () => {
  const { aToken } = useContext(AdminContext);
  return aToken ? (
    <div className="bg-[#F8F9FD]">
      <ToastContainer />
      <Navbar />
      <div className="flex item-start">
        <ScrollToTop />
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/khandan-list" element={<KhandanList />} />
          <Route path="/user-list" element={<UserList />} />
          <Route path="/donation-list" element={<DonationList />} />
          <Route path="/notice-board" element={<NoticeBoard />} />
          <Route path="/manage-team" element={<ManageTeam />} />
          <Route path="/manage-team" element={<ManageTeam />} />
          <Route path="/donation-categories" element={<DonationCategory />} />
          <Route path="/receipt" element={<Receipt />} />
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  );
};

export default App;
