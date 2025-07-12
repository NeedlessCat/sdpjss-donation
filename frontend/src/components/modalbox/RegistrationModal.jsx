import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const RegistrationModal = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  backendUrl,
  onRegistrationSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [khandans, setKhandans] = useState([]);
  const [khandansLoading, setKhandansLoading] = useState(false);
  const [registerData, setRegisterData] = useState({
    fullname: "",
    gender: "",
    dob: "",
    khandanid: "",
    email: "",
    mobile: { code: "+91", number: "" },
    address: {
      currlocation: "",
      country: "",
      state: "",
      district: "",
      city: "",
      postoffice: "",
      pin: "",
      landmark: "",
      street: "",
      apartment: "",
      floor: "",
      room: "",
    },
  });

  // Address presets based on current location
  const ADDRESS_PRESETS = {
    in_manpur: {
      country: "India",
      state: "Bihar",
      district: "Gaya",
      city: "Gaya",
      postoffice: "Manpur",
      pin: "823003",
      currlocation: "In Manpur",
    },
    in_gaya_outside_manpur: {
      country: "India",
      state: "Bihar",
      district: "Gaya",
      city: "Gaya",
      postoffice: "",
      pin: "",
      currlocation: "In Gaya but outside Manpur",
    },
    in_bihar_outside_gaya: {
      country: "India",
      state: "Bihar",
      district: "",
      city: "",
      postoffice: "",
      pin: "",
      currlocation: "In Bihar but outside Gaya",
    },
    in_india_outside_bihar: {
      country: "India",
      state: "",
      district: "",
      city: "",
      postoffice: "",
      pin: "",
      currlocation: "In India but outside Bihar",
    },
    outside_india: {
      country: "",
      state: "",
      district: "",
      city: "",
      postoffice: "",
      pin: "",
      currlocation: "Outside India",
    },
  };

  // Fetch khandans from backend
  const fetchKhandans = async () => {
    setKhandansLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/khandan/allKhandan`);
      if (response.data.success) {
        setKhandans(response.data.khandans);
      } else {
        toast.error("Failed to fetch khandans");
        // Fallback to dummy data if API fails
        setKhandans([
          {
            _id: "60a1234567890123456789ab",
            khandan: "Sharma Khandan",
            address: { street: "MG Road, Delhi", currlocation: "In Delhi" },
          },
          {
            _id: "KH002",
            khandan: "Gupta Khandan",
            address: {
              street: "Park Street, Mumbai",
              currlocation: "In Mumbai",
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching khandans:", error);
      toast.error("Failed to fetch khandans");
      // Fallback to dummy data
      setKhandans([
        {
          _id: "60a1234567890123456789ab",
          khandan: "Sharma Khandan",
          address: { street: "MG Road, Delhi", currlocation: "In Delhi" },
        },
        {
          _id: "KH002",
          khandan: "Gupta Khandan",
          address: { street: "Park Street, Mumbai", currlocation: "In Mumbai" },
        },
      ]);
    } finally {
      setKhandansLoading(false);
    }
  };

  // Fetch khandans when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchKhandans();
    }
  }, [isOpen]);

  // Handle current location change
  const handleCurrentLocationChange = (locationKey) => {
    if (locationKey && ADDRESS_PRESETS[locationKey]) {
      const preset = ADDRESS_PRESETS[locationKey];
      setRegisterData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          ...preset,
        },
      }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await axios.post(backendUrl + "/api/user/register", {
        fullname: registerData.fullname,
        gender: registerData.gender,
        dob: registerData.dob,
        khandanid: registerData.khandanid,
        email: registerData.email,
        mobile: registerData.mobile,
        address: registerData.address,
      });

      if (data.success) {
        toast.success(
          "Registration successful! Check your email/SMS for login credentials."
        );

        // Call the success callback with username if available
        if (onRegistrationSuccess) {
          onRegistrationSuccess(data.username || "");
        }

        onSwitchToLogin();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setRegisterData({
      fullname: "",
      gender: "",
      dob: "",
      khandanid: "",
      email: "",
      mobile: { code: "+91", number: "" },
      address: {
        currlocation: "",
        country: "",
        state: "",
        district: "",
        city: "",
        postoffice: "",
        pin: "",
        landmark: "",
        street: "",
        apartment: "",
        floor: "",
        room: "",
      },
    });
    onClose();
  };

  const selectedKhandan = khandans.find(
    (k) => k._id === registerData.khandanid
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              User Registration
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={registerData.fullname}
                onChange={(e) =>
                  setRegisterData((prev) => ({
                    ...prev,
                    fullname: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={registerData.gender}
                onChange={(e) =>
                  setRegisterData((prev) => ({
                    ...prev,
                    gender: e.target.value,
                  }))
                }
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={registerData.dob}
                onChange={(e) =>
                  setRegisterData((prev) => ({
                    ...prev,
                    dob: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Khandan *
              </label>
              <select
                required
                disabled={khandansLoading}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                value={registerData.khandanid}
                onChange={(e) =>
                  setRegisterData((prev) => ({
                    ...prev,
                    khandanid: e.target.value,
                  }))
                }
              >
                <option value="">
                  {khandansLoading ? "Loading Khandans..." : "Select Khandan"}
                </option>
                {khandans.map((khandan) => (
                  <option key={khandan._id} value={khandan._id}>
                    {khandan.khandan} -{" "}
                    {khandan.address?.street ||
                      khandan.address?.currlocation ||
                      "No address"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="+91"
                  className="w-20 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={registerData.mobile.code}
                  onChange={(e) =>
                    setRegisterData((prev) => ({
                      ...prev,
                      mobile: { ...prev.mobile, code: e.target.value },
                    }))
                  }
                />
                <input
                  type="text"
                  placeholder="Mobile number"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={registerData.mobile.number}
                  onChange={(e) =>
                    setRegisterData((prev) => ({
                      ...prev,
                      mobile: { ...prev.mobile, number: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            {/* Address Fields */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-medium text-gray-700">
                Address Information *
              </h3>

              {/* Current Location Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Location *
                </label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={
                    Object.keys(ADDRESS_PRESETS).find(
                      (key) =>
                        ADDRESS_PRESETS[key].currlocation ===
                        registerData.address.currlocation
                    ) || ""
                  }
                  onChange={(e) => handleCurrentLocationChange(e.target.value)}
                >
                  <option value="">Select Current Location</option>
                  <option value="in_manpur">In Manpur</option>
                  <option value="in_gaya_outside_manpur">
                    In Gaya but outside Manpur
                  </option>
                  <option value="in_bihar_outside_gaya">
                    In Bihar but outside Gaya
                  </option>
                  <option value="in_india_outside_bihar">
                    In India but outside Bihar
                  </option>
                  <option value="outside_india">Outside India</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    value={registerData.address.country}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          country: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    value={registerData.address.state}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          state: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    value={registerData.address.district}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          district: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    value={registerData.address.city}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          city: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Post Office
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    value={registerData.address.postoffice}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          postoffice: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    value={registerData.address.pin}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        address: { ...prev.address, pin: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  value={registerData.address.street}
                  onChange={(e) =>
                    setRegisterData((prev) => ({
                      ...prev,
                      address: {
                        ...prev.address,
                        street: e.target.value,
                      },
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Apartment
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    value={registerData.address.apartment}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          apartment: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Floor
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    value={registerData.address.floor}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          floor: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Room
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    value={registerData.address.room}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          room: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  value={registerData.address.landmark}
                  onChange={(e) =>
                    setRegisterData((prev) => ({
                      ...prev,
                      address: {
                        ...prev.address,
                        landmark: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <p className="font-medium">Note:</p>
              <p>
                Please provide either email or mobile number for receiving login
                credentials.
              </p>
              {selectedKhandan && (
                <p className="mt-2">
                  <strong>Selected Khandan:</strong> {selectedKhandan.khandan}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Registering..." : "Register"}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-red-500 hover:text-red-700 underline"
              >
                Login here
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;
