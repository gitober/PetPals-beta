import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Profile from "./pages/profile";
import Settings from "./pages/settings";
import UserProfile from "./pages/user-profile";
import ThankYou from "./pages/thank-you";
import Privacy from "./pages/privacy";
import "./style/privacy.css";
import Signup from "./features/sign-up/hooks/useSignUp";
import { UserProvider } from "./features/user-context/hooks/UserContext";
import BetaBanner from "./features/beta/components/BetaBanner";
import TestChecklist from "./features/beta/components/TestChecklist";
import ScrollToTop from "./utils/ScrollToTop";

function App() {
  return (
      <BrowserRouter>
        <ScrollToTop />
        <UserProvider>
          <BetaBanner />
          <TestChecklist />
          <Routes>
            <Route index element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
            {/* Dynamic route for usernames */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/userprofile/:username" element={<UserProfile />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </UserProvider>
      </BrowserRouter>
  );
}

export default App;
