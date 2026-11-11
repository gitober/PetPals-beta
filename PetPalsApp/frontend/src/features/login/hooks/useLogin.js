import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../user-context/hooks/UserContext";

const useLogin = (apiUrl) => {
  // Context and Navigation
  const navigate = useNavigate();
  const { setUsername: setContextUsername } = useContext(UserContext);

  // State Management
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [forgotPasswordPopupVisible, setForgotPasswordPopupVisible] = useState(false);
  const [signupPopupVisible, setSignupPopupVisible] = useState(false);
  const [loginDisabled, setLoginDisabled] = useState(true);
  const [error, setError] = useState("");

  // Popup Handlers
  const openForgotPasswordPopup = () => {
    setForgotPasswordPopupVisible(true);
  };

  const openSignupPopup = () => {
    setSignupPopupVisible(true);
  };

  const closeForgotPasswordPopup = () => {
    setForgotPasswordPopupVisible(false);
  };

  const closeSignupPopup = () => {
    setSignupPopupVisible(false);
  };

  // Enable/Disable Login Button
  useEffect(() => {
    setLoginDisabled(!(username && password));
  }, [username, password]);

  // Beta: if someone was already logged in on this browser (for example they
  // came back to the login page and tried the demo again), log that account
  // out on the server, so an old test account isn't left behind.
  const endPreviousSession = (newUserId) => {
    const previousToken = localStorage.getItem("accessToken");
    const previousUserId = localStorage.getItem("currentUserId");
    if (!previousToken || previousUserId === newUserId) return;

    fetch(`${apiUrl}/users/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${previousToken}` },
      credentials: "include",
      keepalive: true,
    }).catch(() => {
      // Not critical: an old test account still expires after an hour
    });
  };

  // Save the session and go to the home page
  const completeLogin = (responseData) => {
    const accessToken = responseData.accessToken;
    const userId = responseData._id;

    if (!accessToken || !userId) {
      throw new Error("Access token or user ID not found in response data");
    }

    endPreviousSession(userId);

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("currentUserId", userId);
    localStorage.setItem("username", responseData.username);

    setContextUsername(responseData.username);

    navigate("/home");
  };

  // Beta: create a temporary test account and log straight in
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemoLogin = async () => {
    setError("");
    setDemoLoading(true);

    try {
      const demoResponse = await fetch(`${apiUrl}/users/demo`, {
        method: "POST",
        credentials: "include",
      });
      const responseData = await demoResponse.json();

      if (demoResponse.ok) {
        completeLogin(responseData);
      } else {
        setError(responseData.error || "Could not start the demo. Please try again.");
      }
    } catch (error) {
      console.error("Error during demo login:", error.message);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setDemoLoading(false);
    }
  };

  // Handle Login Submission
  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError(""); // Clear previous errors

    try {
      const loginData = {
        username: username.trim(),
        password: password,
      };

      const loginUrl = `${apiUrl}/users/login`;

      const loginResponse = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const responseData = await loginResponse.json();

      if (loginResponse.ok) {
        completeLogin(responseData);
      } else {
        console.error("Login failed with status:", loginResponse.status);
        setError(responseData.error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error.message);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    loginDisabled,
    handleLoginSubmit,
    handleDemoLogin,
    demoLoading,
    forgotPasswordPopupVisible,
    openForgotPasswordPopup,
    closeForgotPasswordPopup,
    signupPopupVisible,
    openSignupPopup,
    closeSignupPopup,
    error, // Return the error to display it in the UI
  };
};

export default useLogin;