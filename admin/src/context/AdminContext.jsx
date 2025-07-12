import axios from "axios";
import { useState } from "react";
import { createContext } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  // New state variables for lists and counts
  const [userList, setUserList] = useState([]);
  const [userCount, setUserCount] = useState(0);

  const [totalDonation, setTotalDonation] = useState(0);

  const [noticeList, setNoticeList] = useState([]);
  const [noticeCount, setNoticeCount] = useState(0);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Get khandan list with count
  const getKhandanList = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/khandan-list", {
        headers: { aToken },
      });
      if (data.success) {
        return data;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  // Get user list with count
  const getUserList = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/user-list", {
        headers: { aToken },
      });
      if (data.success) {
        setUserList(data.users);
        setUserCount(data.count);
        console.log(data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get user count with details
  const getUserCountDetails = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/user-count", {
        headers: { aToken },
      });
      if (data.success) {
        setUserCount(data.totalUsers);
        console.log(data);
        return data; // Return for additional details if needed
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get total donation amount
  const getTotalDonationData = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/admin/total-donation",
        { headers: { aToken } }
      );
      if (data.success) {
        setTotalDonation(data.totalAmount);
        console.log(data);
        return data; // Return for additional donation details
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const [donationList, setDonationList] = useState([]);

  const getDonationList = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/admin/donation-list",
        {
          headers: { aToken },
        }
      );

      console.log("mydonation data: ", data);
      if (data.success) {
        setDonationList(data.donations);
        return data;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get notice list with count
  const getNoticeList = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/notice-list", {
        headers: { aToken },
      });
      if (data.success) {
        setNoticeList(data.notices);
        setNoticeCount(data.count);
        console.log(data);
        return data;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Add a new notice
  const addNotice = async (noticeData) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/add-notice",
        noticeData,
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        // Refresh notice list after adding
        await getNoticeList();
        return data;
      } else {
        toast.error(data.message);
        return { success: false };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false };
    }
  };

  // Update a notice
  const updateNotice = async (noticeId, noticeData) => {
    console.log("From admin COntext: ", noticeId);
    try {
      const { data } = await axios.put(
        backendUrl + `/api/admin/update-notice/${noticeId}`,
        noticeData,
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        // Refresh notice list after updating
        await getNoticeList();
        return data;
      } else {
        toast.error(data.message);
        return { success: false };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false };
    }
  };

  // Delete a notice
  const deleteNotice = async (noticeId) => {
    try {
      const { data } = await axios.delete(
        backendUrl + `/api/admin/delete-notice/${noticeId}`,
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        // Refresh notice list after deleting
        await getNoticeList();
        return data;
      } else {
        toast.error(data.message);
        return { success: false };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false };
    }
  };

  const value = {
    aToken,
    setAToken,
    backendUrl,

    // Family related
    getKhandanList,
    getTotalDonationData,

    // User related
    userList,
    userCount,
    getUserList,
    getUserCountDetails,

    // Notice related
    noticeList,
    noticeCount,
    getNoticeList,
    addNotice,
    updateNotice,
    deleteNotice,

    donationList,
    getDonationList,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
