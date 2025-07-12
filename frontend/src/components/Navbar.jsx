import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import LoginModal from "./modalbox/LoginModal"; // Import your LoginModal component

const Navbar = () => {
  const navigate = useNavigate();
  const { state, setState, utoken, setUToken, backendUrl } =
    useContext(AppContext);

  const [showMenu, setShowMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const logout = () => {
    setUToken(false);
    localStorage.removeItem("utoken");
    navigate("/");
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
    setState("Login");
  };

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    // You can either navigate to register page or open register modal
    // For now, I'll assume you want to navigate to register page
    setState("Register");
    navigate("/register");
  };

  return (
    <>
      <div className="mx-4 sm:mx-[5%]">
        {/* Red Top Bar with Rounded Bottom Corners */}
        <div className="bg-gradient-to-r from-red-800 to-red-900 text-white py-2 px-4 rounded-b-3xl">
          {/* Content */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            {/* Left side - Contact info (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>📧</span>
                <span>support@example.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📞</span>
                <span>+91 12345 67890</span>
              </div>
            </div>

            {/* Mobile - Only show establishment info */}
            <div className="flex md:hidden items-center justify-between w-full">
              <div className="text-xs">
                <span>Estd. 1928</span>
              </div>
              <div className="text-xs">
                <span>Reg No: 123/3303</span>
              </div>
            </div>

            {/* Right side - Establishment info (desktop) */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-sm">
                <span>Estd. 1928</span>
              </div>
              <div className="text-sm">
                <span>Reg No: 123/3303</span>
              </div>
            </div>
          </div>
        </div>

        {/* Original Navbar */}
        <div className="flex items-center justify-between text-sm py-4 mb-5 mx-4 sm:mx-6 lg:mx-8">
          <img
            onClick={() => navigate("/")}
            className="w-44 cursor-pointer"
            src={assets.logo}
            alt=""
          />

          <div className="hidden md:inline-flex bg-[#f5f5f0] py-2 px-4 rounded-full gap-6 text-sm">
            <NavLink
              to="/"
              className="text-gray-600 hover:text-[#CC5500] transition-colors"
            >
              HOME
            </NavLink>
            <NavLink
              to={"/about"}
              className="text-gray-600 hover:text-[#CC5500] transition-colors"
            >
              ABOUT
            </NavLink>
            <NavLink
              to="/team"
              className="text-gray-600 hover:text-[#CC5500] transition-colors"
            >
              TEAM
            </NavLink>
            <NavLink
              to="/contact"
              className="text-gray-600 hover:text-[#CC5500] transition-colors"
            >
              CONTACT US
            </NavLink>
          </div>

          <div className="flex items-center">
            <div>
              {utoken ? (
                <div className="flex items-center gap-2 cursor-pointer group relative">
                  <img
                    className="w-8 rounded-full"
                    src={assets.profile}
                    alt=""
                  />
                  <img className="w-2.5" src={assets.dropdown_icon} alt="" />
                  <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
                    <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                      <p
                        onClick={() => navigate("/my-profile")}
                        className="hover:text-black cursor-pointer"
                      >
                        My Profile
                      </p>
                      <p
                        onClick={() => navigate("/my-donation")}
                        className="hover:text-black cursor-pointer"
                      >
                        My Donations
                      </p>

                      <p
                        onClick={logout}
                        className="hover:text-black cursor-pointer"
                      >
                        Logout
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block"
                >
                  Login
                </button>
              )}
            </div>
            <img
              onClick={() => setShowMenu(true)}
              className="w-6 md:hidden"
              src={assets.menu_icon}
              alt=""
            />
            {/* Mobile Menu */}
            <div
              className={`${
                showMenu ? "fixed w-full" : "h-0 w-0"
              } md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}
            >
              <div className="flex items-center justify-between px-5 py-6">
                <img className="w-36" src={assets.logo} alt="" />
                <img
                  className="w-7"
                  onClick={() => setShowMenu(false)}
                  src={assets.cross_icon}
                  alt=""
                />
              </div>
              <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
                <NavLink onClick={() => setShowMenu(false)} to="/">
                  <p className="px-4 py-2 rounded inline-block">HOME</p>
                </NavLink>
                <NavLink onClick={() => setShowMenu(false)} to="/about">
                  <p className="px-4 py-2 rounded inline-block">ABOUT</p>
                </NavLink>
                <NavLink onClick={() => setShowMenu(false)} to="/team">
                  <p className="px-4 py-2 rounded inline-block">TEAM</p>
                </NavLink>
                <NavLink onClick={() => setShowMenu(false)} to="/contact">
                  <p className="px-4 py-2 rounded inline-block">CONTACT US</p>
                </NavLink>
                {/* Mobile Login Button */}
                {!utoken && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleLoginClick();
                    }}
                    className="bg-primary text-white px-8 py-3 rounded-full font-light mt-4"
                  >
                    Login
                  </button>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={handleSwitchToRegister}
        backendUrl={backendUrl}
        setUToken={setUToken}
      />
    </>
  );
};

export default Navbar;
