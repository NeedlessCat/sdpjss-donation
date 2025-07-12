import React, { useState, useMemo, useContext, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Briefcase,
  GraduationCap,
  User,
  Activity,
  Loader2,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { AdminContext } from "../context/AdminContext";

const UserList = () => {
  const { userList, getUserList, aToken } = useContext(AdminContext);

  const [expandedUser, setExpandedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);

  // Load users when component mounts
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        await getUserList();
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (aToken) {
      loadUsers();
    }
  }, [aToken]);

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    let filtered = userList || [];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((user) =>
        user.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by gender
    if (genderFilter !== "all") {
      filtered = filtered.filter((user) => user.gender === genderFilter);
    }

    // Sort users
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (
        sortBy === "createdAt" ||
        sortBy === "updatedAt" ||
        sortBy === "dob"
      ) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortBy === "fullname") {
        aValue = aValue?.toLowerCase() || "";
        bValue = bValue?.toLowerCase() || "";
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, genderFilter, sortBy, sortOrder, userList]);

  // Statistics
  const totalUsers = userList?.length || 0;
  const maleUsers =
    userList?.filter((user) => user.gender === "male").length || 0;
  const femaleUsers =
    userList?.filter((user) => user.gender === "female").length || 0;
  const otherUsers =
    userList?.filter((user) => user.gender === "other").length || 0;

  const toggleUserExpansion = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl sm:text-3xl font-bold ${color}`}>
            {value.toLocaleString()}
          </p>
        </div>
        <div
          className={`p-3 rounded-full ${color
            .replace("text-", "bg-")
            .replace("-600", "-100")}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          User Management
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Manage and view all registered users and their details
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={<Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />}
          color="text-blue-600"
        />
        <StatCard
          title="Male Users"
          value={maleUsers}
          icon={<User className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />}
          color="text-green-600"
        />
        <StatCard
          title="Female Users"
          value={femaleUsers}
          icon={<User className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600" />}
          color="text-pink-600"
        />
        <StatCard
          title="Other"
          value={otherUsers}
          icon={<User className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />}
          color="text-purple-600"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-4 sm:p-6">
          {/* Search Bar */}
          <div className="relative mb-4 sm:mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search users by full name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base"
            />
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Gender Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              >
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              >
                <option value="createdAt">Registration Date</option>
                <option value="fullname">Name</option>
                <option value="dob">Date of Birth</option>
                <option value="updatedAt">Last Updated</option>
              </select>
            </div>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              {sortOrder === "asc" ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
              {sortOrder === "asc" ? "Ascending" : "Descending"}
            </button>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Users ({filteredUsers.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">
                {searchTerm || genderFilter !== "all"
                  ? "No users found matching your criteria."
                  : "No users found."}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isExpanded = expandedUser === user._id;
              const age = calculateAge(user.dob);

              return (
                <div key={user._id} className="p-3 sm:p-6">
                  {/* User Header */}
                  <div
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => toggleUserExpansion(user._id)}
                  >
                    {/* User Image/Icon */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-1 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-lg truncate">
                          {user.fullname || "N/A"}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Age: {age}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              user.gender === "male"
                                ? "bg-blue-100 text-blue-800"
                                : user.gender === "female"
                                ? "bg-pink-100 text-pink-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {user.gender?.charAt(0).toUpperCase() +
                              user.gender?.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Joined: {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expand/Collapse Icon */}
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </div>

                  {/* Expanded User Details */}
                  {isExpanded && (
                    <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
                      {/* Personal Information */}
                      <div className="bg-gray-50 rounded-xl p-3 sm:p-6">
                        <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
                          <User className="w-4 h-4 sm:w-5 sm:h-5" />
                          Personal Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                            <span>DOB: {formatDate(user.dob)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Username:</span>
                            <span>{user.username || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Khandan:</span>
                            <span>{user.khandanid?.name || "N/A"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="bg-gray-50 rounded-xl p-3 sm:p-6">
                        <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
                          <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                          Contact Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                            <span className="truncate">
                              {user.contact?.email || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                            <span>
                              {user.contact?.mobileno?.code || ""}{" "}
                              {user.contact?.mobileno?.number || "N/A"}
                            </span>
                          </div>
                          {user.contact?.whatsappno && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                              <span>WhatsApp: {user.contact.whatsappno}</span>
                            </div>
                          )}
                          {user.address && (
                            <div className="flex items-start gap-2 col-span-1 sm:col-span-2">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                              <span className="break-words">
                                {[
                                  user.address.apartment,
                                  user.address.street,
                                  user.address.city,
                                  user.address.district,
                                  user.address.state,
                                  user.address.country,
                                  user.address.pin,
                                ]
                                  .filter(Boolean)
                                  .join(", ") || "N/A"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Professional Information */}
                      <div className="bg-gray-50 rounded-xl p-3 sm:p-6">
                        <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
                          <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                          Professional Details
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <span className="text-gray-500">Category:</span>{" "}
                            {user.profession?.category || "N/A"}
                          </div>
                          <div>
                            <span className="text-gray-500">Job:</span>{" "}
                            {user.profession?.job || "N/A"}
                          </div>
                          {user.profession?.specialization && (
                            <div>
                              <span className="text-gray-500">
                                Specialization:
                              </span>{" "}
                              {user.profession.specialization}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Registration Info */}
                      <div className="bg-blue-50 rounded-xl p-3 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="text-xs sm:text-sm">
                            <span className="text-gray-600">
                              Registered on:
                            </span>
                            <span className="font-medium ml-2">
                              {formatDate(user.createdAt)}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm">
                            <span className="text-gray-600">Last Updated:</span>
                            <span className="font-medium ml-2">
                              {formatDate(user.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;
