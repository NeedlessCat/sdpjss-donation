import { useEffect } from "react";
import { createContext, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [state, setState] = useState("Register");

  // Token for the user login
  const [utoken, setUToken] = useState(
    localStorage.getItem("utoken") ? localStorage.getItem("utoken") : false
  );

  const [userData, setUserData] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add donations state
  const [donations, setDonations] = useState([]);
  const [donationsLoading, setDonationsLoading] = useState(false);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { utoken },
      });
      console.log(data);
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch user donations
  const loadUserDonations = async () => {
    try {
      if (!userData || !userData._id) {
        console.log("User data not available yet");
        return;
      }

      setDonationsLoading(true);
      const { data } = await axios.get(
        backendUrl + "/api/user/my-donations", // Adjust the endpoint as needed
        {
          headers: {
            utoken,
          },
        }
      );

      console.log("Donations data:", data);
      if (data.success) {
        setDonations(data.donations);
      } else {
        toast.error(data.message);
        setDonations([]);
      }
    } catch (error) {
      console.log("Error loading donations:", error);
      toast.error("Failed to load donations");
      setDonations([]);
    } finally {
      setDonationsLoading(false);
    }
  };

  const value = {
    backendUrl,
    state,
    setState,
    utoken,
    setUToken,
    loadUserData,
    userData,
    setUserData,
    loading,
    setLoading,
    donations,
    setDonations,
    donationsLoading,
    loadUserDonations,
  };

  useEffect(() => {
    if (utoken) {
      loadUserData();
    } else {
      setUserData(false);
      setDonations([]);
    }
  }, [utoken]);

  // Load donations when userData is available
  useEffect(() => {
    if (userData && userData._id) {
      loadUserDonations();
    }
  }, [userData]);

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
