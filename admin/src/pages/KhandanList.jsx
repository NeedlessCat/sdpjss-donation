import React, { useState, useEffect, useContext } from "react";
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  Phone,
  MapPin,
  Home,
  UserCheck,
  Building,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const KhandanSection = () => {
  const [khandanList, setKhandanList] = useState([]);
  const [khandanCount, setKhandanCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingKhandan, setEditingKhandan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    khandan: "",
    contact: {
      mobileno: {
        code: "+91",
        number: "",
      },
    },
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

  // You'll need to get these from your context or props
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const aToken = localStorage.getItem("aToken");

  // Get khandan list with count
  const getKhandanList = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(backendUrl + "/api/admin/khandan-list", {
        headers: { aToken },
      });
      if (data.success) {
        setKhandanList(data.khandanList);
        setKhandanCount(data.count);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add a new khandan
  const addKhandan = async (khandanData) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/add-khandan",
        khandanData,
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        await getKhandanList(); // Refresh the list
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false };
    }
  };

  // Update a khandan
  const updateKhandan = async (id, khandanData) => {
    try {
      const { data } = await axios.put(
        backendUrl + `/api/admin/update-khandan/${id}`,
        khandanData,
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        await getKhandanList(); // Refresh the list
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false };
    }
  };

  // Delete a khandan
  const deleteKhandan = async (id) => {
    try {
      const { data } = await axios.delete(
        backendUrl + `/api/admin/delete-khandan/${id}`,
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        await getKhandanList(); // Refresh the list
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false };
    }
  };

  // Load khandans on component mount
  useEffect(() => {
    getKhandanList();
  }, []);

  const handleAddKhandan = () => {
    setEditingKhandan(null);
    setFormData({
      khandan: "",
      contact: {
        mobileno: {
          code: "+91",
          number: "",
        },
      },
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
    setShowModal(true);
  };

  const handleEditKhandan = (khandan) => {
    setEditingKhandan(khandan);
    setFormData({
      khandan: khandan.khandan,
      contact: khandan.contact || {
        mobileno: {
          code: "+91",
          number: "",
        },
      },
      address: khandan.address || {
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
    setShowModal(true);
  };

  const handleDeleteKhandan = async (khandanId) => {
    if (window.confirm("Are you sure you want to delete this khandan?")) {
      setLoading(true);
      await deleteKhandan(khandanId);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.khandan.trim()) {
      toast.error("Khandan name is required");
      return;
    }

    setLoading(true);
    let result;

    if (editingKhandan) {
      result = await updateKhandan(editingKhandan._id, formData);
    } else {
      result = await addKhandan(formData);
    }

    if (result && result.success) {
      setShowModal(false);
      setEditingKhandan(null);
      setFormData({
        khandan: "",
        contact: {
          mobileno: {
            code: "+91",
            number: "",
          },
        },
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
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "khandan") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (name === "phone") {
      setFormData((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          mobileno: {
            ...prev.contact.mobileno,
            number: value,
          },
        },
      }));
    } else if (name === "phoneCode") {
      setFormData((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          mobileno: {
            ...prev.contact.mobileno,
            code: value,
          },
        },
      }));
    } else {
      // Handle address fields
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const formatContactDisplay = (contact) => {
    if (!contact || !contact.mobileno) return "";
    return `${contact.mobileno.code} ${contact.mobileno.number}`;
  };

  const formatAddressDisplay = (address) => {
    if (!address) return "";
    const parts = [
      address.street,
      address.apartment,
      address.currlocation,
      address.city,
      address.district,
      address.state,
      address.country,
      address.pin,
    ].filter(Boolean);
    return parts.join(", ");
  };

  if (loading && khandanList.length === 0) {
    return (
      <div className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading khandans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Khandan Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage and view all family groups (Khandans)
            </p>
          </div>
          <button
            onClick={handleAddKhandan}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Khandan
          </button>
        </div>
      </div>

      {/* Total Khandans Count */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Total Khandans
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {khandanCount.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-full bg-green-100">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Khandan List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            All Khandans ({khandanCount})
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {khandanList.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">
                No khandans available. Add your first khandan!
              </p>
            </div>
          ) : (
            khandanList.map((khandan) => (
              <div key={khandan._id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Khandan Icon */}
                  <div className="p-3 rounded-full bg-green-100 flex-shrink-0 self-start">
                    <Home className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>

                  {/* Khandan Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-lg mb-1">
                          {khandan.khandan}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            Family Group
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 self-start">
                        <button
                          onClick={() => handleEditKhandan(khandan)}
                          disabled={loading}
                          className="p-2 bg-blue-100 hover:bg-blue-200 disabled:bg-blue-50 text-blue-700 rounded-lg transition-colors"
                          title="Edit Khandan"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteKhandan(khandan._id)}
                          disabled={loading}
                          className="p-2 bg-red-100 hover:bg-red-200 disabled:bg-red-50 text-red-700 rounded-lg transition-colors"
                          title="Delete Khandan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Khandan Details */}
                    <div className="space-y-2 mb-3">
                      {formatContactDisplay(khandan.contact) && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                          <span>{formatContactDisplay(khandan.contact)}</span>
                        </div>
                      )}
                      {formatAddressDisplay(khandan.address) && (
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="leading-relaxed">
                            {formatAddressDisplay(khandan.address)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Khandan Meta Information */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Created: {formatDate(khandan.createdAt)}</span>
                      </div>
                      {khandan.updatedAt &&
                        khandan.updatedAt !== khandan.createdAt && (
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>
                              Updated: {formatDate(khandan.updatedAt)}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {editingKhandan ? "Edit Khandan" : "Add New Khandan"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Khandan Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khandan Name *
                </label>
                <input
                  type="text"
                  name="khandan"
                  value={formData.khandan}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm sm:text-base disabled:bg-gray-50"
                  placeholder="Enter khandan name"
                />
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Country Code
                    </label>
                    <input
                      type="text"
                      name="phoneCode"
                      value={formData.contact.mobileno.code}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm disabled:bg-gray-50"
                      placeholder="+91"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.contact.mobileno.number}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm disabled:bg-gray-50"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Address Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Current Location
                    </label>
                    <input
                      type="text"
                      name="currlocation"
                      value={formData.address.currlocation}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm disabled:bg-gray-50"
                      placeholder="Current location"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm disabled:bg-gray-50"
                      placeholder="Country"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm disabled:bg-gray-50"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.address.district}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm disabled:bg-gray-50"
                      placeholder="District"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm disabled:bg-gray-50"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      name="pin"
                      value={formData.address.pin}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm disabled:bg-gray-50"
                      placeholder="PIN Code"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Street
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm disabled:bg-gray-50"
                      placeholder="Street"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Apartment/Building
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.address.apartment}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm disabled:bg-gray-50"
                      placeholder="Apartment/Building"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Landmark
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.address.landmark}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm disabled:bg-gray-50"
                      placeholder="Landmark"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Post Office
                    </label>
                    <input
                      type="text"
                      name="postoffice"
                      value={formData.address.postoffice}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm disabled:bg-gray-50"
                      placeholder="Post Office"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {loading
                    ? "Processing..."
                    : editingKhandan
                    ? "Update Khandan"
                    : "Add Khandan"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KhandanSection;
