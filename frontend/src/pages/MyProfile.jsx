import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Edit,
  UserCircle,
  Save,
  X,
  Key,
} from "lucide-react";

const MyProfile = () => {
  const { userData, loading, utoken, backendUrl, loadUserData } =
    useContext(AppContext);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingSections, setEditingSections] = useState({});
  const [editedData, setEditedData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No Profile Data
          </h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAddress = (address) => {
    if (!address) return "Not provided";
    const parts = [
      address.apartment,
      address.street,
      address.city,
      address.district,
      address.state,
      address.country,
      address.pin,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  const handleEditSection = (sectionName) => {
    setEditingSections((prev) => ({ ...prev, [sectionName]: true }));

    // Initialize edited data with current values
    if (sectionName === "personal") {
      setEditedData((prev) => ({
        ...prev,
        fullname: userData.fullname || "",
        username: userData.username || "",
        dob: userData.dob || "",
        gender: userData.gender || "",
      }));
    } else if (sectionName === "contact") {
      setEditedData((prev) => ({
        ...prev,
        email: userData.contact?.email || "",
        mobileCode: userData.contact?.mobileno?.code || "+91",
        mobileNumber: userData.contact?.mobileno?.number || "",
        whatsappno: userData.contact?.whatsappno || "",
      }));
    } else if (sectionName === "address") {
      setEditedData((prev) => ({
        ...prev,
        currlocation: userData.address?.currlocation || "",
        apartment: userData.address?.apartment || "",
        street: userData.address?.street || "",
        city: userData.address?.city || "",
        district: userData.address?.district || "",
        state: userData.address?.state || "",
        country: userData.address?.country || "",
        pin: userData.address?.pin || "",
        landmark: userData.address?.landmark || "",
      }));
    } else if (sectionName === "professional") {
      setEditedData((prev) => ({
        ...prev,
        category: userData.profession?.category || "",
        job: userData.profession?.job || "",
        specialization: userData.profession?.specialization || "",
      }));
    }
  };

  const handleCancelEdit = (sectionName) => {
    setEditingSections((prev) => ({ ...prev, [sectionName]: false }));
    setEditedData({});
  };

  const handleSaveSection = async (sectionName) => {
    setIsLoading(true);

    try {
      // Prepare the data based on section
      let updatePayload = { userId: userData._id };

      if (sectionName === "personal") {
        updatePayload = {
          ...updatePayload,
          fullname: editedData.fullname,
          username: editedData.username,
          dob: editedData.dob,
          gender: editedData.gender,
        };
      } else if (sectionName === "contact") {
        updatePayload = {
          ...updatePayload,
          email: editedData.email,
          mobileno: {
            code: editedData.mobileCode,
            number: editedData.mobileNumber,
          },
          contact: {
            ...userData.contact,
            email: editedData.email,
            mobileno: {
              code: editedData.mobileCode,
              number: editedData.mobileNumber,
            },
            whatsappno: editedData.whatsappno,
          },
        };
      } else if (sectionName === "address") {
        updatePayload = {
          ...updatePayload,
          address: {
            currlocation: editedData.currlocation,
            apartment: editedData.apartment,
            street: editedData.street,
            city: editedData.city,
            district: editedData.district,
            state: editedData.state,
            country: editedData.country,
            pin: editedData.pin,
            landmark: editedData.landmark,
          },
        };
      } else if (sectionName === "professional") {
        updatePayload = {
          ...updatePayload,
          profession: {
            category: editedData.category,
            job: editedData.job,
            specialization: editedData.specialization,
          },
        };
      }

      // Make API call
      const response = await axios.post(
        `${backendUrl}/api/user/update-profile`,
        updatePayload,
        {
          headers: {
            utoken,
          },
        }
      );

      if (response.data.success) {
        // Update was successful
        setEditingSections((prev) => ({ ...prev, [sectionName]: false }));
        setEditedData({});

        // Refresh user data from context
        await loadUserData();

        alert(`${sectionName} section updated successfully!`);
      } else {
        // Handle API error
        alert(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);

      // Handle different types of errors
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else if (error.message) {
        alert(error.message);
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <UserCircle className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {userData.fullname || "Name not provided"}
                  </h1>
                  <p className="text-lg text-gray-600">
                    @{userData.username || "username"}
                  </p>
                  <div className="flex items-center mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        userData.gender === "male"
                          ? "bg-blue-100 text-blue-800"
                          : userData.gender === "female"
                          ? "bg-pink-100 text-pink-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {userData.gender
                        ? userData.gender.charAt(0).toUpperCase() +
                          userData.gender.slice(1)
                        : "Not specified"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <Key className="w-4 h-4" />
                <span>Change Password</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Personal Information
              </h2>
              <div className="flex items-center space-x-2">
                {editingSections.personal ? (
                  <>
                    <button
                      onClick={() => handleSaveSection("personal")} // or respective section name
                      disabled={isLoading}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Save"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCancelEdit("personal")}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEditSection("personal")}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Full Name
                </label>
                {editingSections.personal ? (
                  <input
                    type="text"
                    value={editedData.fullname || ""}
                    onChange={(e) =>
                      handleInputChange("fullname", e.target.value)
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 mt-1">
                    {userData.fullname || "Not provided"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Username
                </label>
                {editingSections.personal ? (
                  <input
                    type="text"
                    value={editedData.username || ""}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 mt-1">
                    @{userData.username || "Not provided"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Date of Birth
                </label>
                {editingSections.personal ? (
                  <input
                    type="date"
                    value={editedData.dob ? editedData.dob.split("T")[0] : ""}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center mt-1">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{formatDate(userData.dob)}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Gender
                </label>
                {editingSections.personal ? (
                  <select
                    value={editedData.gender || ""}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-900 mt-1 capitalize">
                    {userData.gender || "Not specified"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-green-600" />
                Contact Information
              </h2>
              <div className="flex items-center space-x-2">
                {editingSections.contact ? (
                  <>
                    <button
                      onClick={() => handleSaveSection("contact")}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Save"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancelEdit("contact")}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEditSection("contact")}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                {editingSections.contact ? (
                  <input
                    type="email"
                    value={editedData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center mt-1">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">
                      {userData.contact?.email || "Not provided"}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Mobile Number
                </label>
                {editingSections.contact ? (
                  <div className="flex mt-1 space-x-2">
                    <select
                      value={editedData.mobileCode || "+91"}
                      onChange={(e) =>
                        handleInputChange("mobileCode", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+61">+61</option>
                    </select>
                    <input
                      type="tel"
                      value={editedData.mobileNumber || ""}
                      onChange={(e) =>
                        handleInputChange("mobileNumber", e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <div className="flex items-center mt-1">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">
                      {userData.contact?.mobileno?.code || "+91"}{" "}
                      {userData.contact?.mobileno?.number || "Not provided"}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  WhatsApp Number
                </label>
                {editingSections.contact ? (
                  <input
                    type="tel"
                    value={editedData.whatsappno || ""}
                    onChange={(e) =>
                      handleInputChange("whatsappno", e.target.value)
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center mt-1">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">
                      {userData.contact?.whatsappno || "Not provided"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-red-600" />
                Address Information
              </h2>
              <div className="flex items-center space-x-2">
                {editingSections.address ? (
                  <>
                    <button
                      onClick={() => handleSaveSection("address")}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Save"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancelEdit("address")}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEditSection("address")}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Current Location
                </label>
                {editingSections.address ? (
                  <input
                    type="text"
                    value={editedData.currlocation || ""}
                    onChange={(e) =>
                      handleInputChange("currlocation", e.target.value)
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 mt-1">
                    {userData.address?.currlocation || "Not provided"}
                  </p>
                )}
              </div>
              {editingSections.address ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Apartment
                    </label>
                    <input
                      type="text"
                      value={editedData.apartment || ""}
                      onChange={(e) =>
                        handleInputChange("apartment", e.target.value)
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Street
                    </label>
                    <input
                      type="text"
                      value={editedData.street || ""}
                      onChange={(e) =>
                        handleInputChange("street", e.target.value)
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      City
                    </label>
                    <input
                      type="text"
                      value={editedData.city || ""}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      District
                    </label>
                    <input
                      type="text"
                      value={editedData.district || ""}
                      onChange={(e) =>
                        handleInputChange("district", e.target.value)
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      State
                    </label>
                    <input
                      type="text"
                      value={editedData.state || ""}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Country
                    </label>
                    <input
                      type="text"
                      value={editedData.country || ""}
                      onChange={(e) =>
                        handleInputChange("country", e.target.value)
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      value={editedData.pin || ""}
                      onChange={(e) => handleInputChange("pin", e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Landmark
                    </label>
                    <input
                      type="text"
                      value={editedData.landmark || ""}
                      onChange={(e) =>
                        handleInputChange("landmark", e.target.value)
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Full Address
                    </label>
                    <div className="flex items-start mt-1">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-900">
                        {formatAddress(userData.address)}
                      </p>
                    </div>
                  </div>
                  {userData.address?.landmark && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Landmark
                      </label>
                      <p className="text-gray-900 mt-1">
                        {userData.address.landmark}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                Professional Information
              </h2>
              <div className="flex items-center space-x-2">
                {editingSections.professional ? (
                  <>
                    <button
                      onClick={() => handleSaveSection("professional")}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Save"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancelEdit("professional")}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEditSection("professional")}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Category
                </label>
                {editingSections.professional ? (
                  <input
                    type="text"
                    value={editedData.category || ""}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 mt-1">
                    {userData.profession?.category || "Not provided"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Job Title
                </label>
                {editingSections.professional ? (
                  <input
                    type="text"
                    value={editedData.job || ""}
                    onChange={(e) => handleInputChange("job", e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 mt-1">
                    {userData.profession?.job || "Not provided"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Specialization
                </label>
                {editingSections.professional ? (
                  <input
                    type="text"
                    value={editedData.specialization || ""}
                    onChange={(e) =>
                      handleInputChange("specialization", e.target.value)
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 mt-1">
                    {userData.profession?.specialization || "Not provided"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Account Information
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Account Created
                </label>
                <p className="text-gray-900 mt-1">
                  {formatDate(userData.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Updated
                </label>
                <p className="text-gray-900 mt-1">
                  {formatDate(userData.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <PasswordChangeModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}
    </div>
  );
};
// Password Change Modal Component (continuation)
const PasswordChangeModal = ({ isOpen, onClose }) => {
  const { backendUrl, utoken } = useContext(AppContext);

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!passwords.oldPassword) {
      newErrors.oldPassword = "Current password is required";
    }

    if (!passwords.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwords.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long";
    }

    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (passwords.oldPassword === passwords.newPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Get context values

      // Make API call to change password
      const response = await axios.post(
        `${backendUrl}/api/user/change-password`,
        {
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword,
        },
        {
          headers: {
            utoken: utoken,
          },
        }
      );

      if (response.data.success) {
        alert("Password changed successfully!");
        handleClose();
      } else {
        setErrors({
          submit: response.data.message || "Failed to change password",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);

      // Handle different types of errors
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else if (error.message) {
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: "Failed to change password. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPasswords({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Key className="w-5 h-5 mr-2 text-red-600" />
            Change Password
          </h3>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={passwords.oldPassword}
                onChange={(e) =>
                  handleInputChange("oldPassword", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.oldPassword ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter your current password"
                disabled={isLoading}
              />
              {errors.oldPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.oldPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.newPassword ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter your new password"
                disabled={isLoading}
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.newPassword}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.confirmPassword ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Confirm your new password"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Changing...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyProfile;
