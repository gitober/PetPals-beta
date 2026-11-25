import React, { useState } from "react";

import SignupPopup from "../features/sign-up/components/signUpPopup";
import ForgotPassword from "../features/forgot-password/components/forgotPasswordPopup";

import useLogin from "../features/login/hooks/useLogin";
import useSignup from "../features/sign-up/hooks/useSignUp";

import "../style/login.css";
import "../style/forgot-password-popup.css";
import "../style/signup-popup.css";

function Login() {
  const apiUrl = process.env.REACT_APP_API_URL || "/api";

  // Login hook
  const {
    username,
    setUsername,
    password,
    setPassword,
    // loginDisabled, (beta: login form switched off)
    handleLoginSubmit,
    handleDemoLogin,
    demoLoading,
    forgotPasswordPopupVisible,
    // openForgotPasswordPopup, (beta: link hidden)
    closeForgotPasswordPopup,
    error, // Login error
  } = useLogin(apiUrl);

  // Signup hook
  const {
    signupFormData,
    signupPopupVisible,
    statusMessage,
    statusType,
    handleSignupInputChange,
    handleSignupBlur,
    handleSignupSubmit,
    closeSignupPopup,
    // openSignupPopup, (beta: sign up switched off)
    fieldErrors,
  } = useSignup(apiUrl);

  const [showPassword, setShowPassword] = useState(false);


  return (
    <div className="login-page-wrapper">

      <div className="login-page-container">
        {/* Logo Section */}
        <div className="logo-container">
          <div className="logo">
            <img src="/img/navbar.png" alt="Logo" />
          </div>
        </div>

        {/* Login Form Section */}
        <div className="login-container">
          <div className="login-form">
            <form onSubmit={handleLoginSubmit} id="loginForm">
              <h1 className="h1">Log in</h1>
              <input
                type="text"
                name="username"
                id="loginUsername"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled /* Beta: demo login only */
              />
              <span style={{ position: "relative", width: "100%" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled /* Beta: demo login only */
                  className="password-input"
                />
                <i
                  className={`fas ${showPassword ? "fa-eye" : "fa-eye-slash"
                    } toggle-password-icon`}
                  style={{ pointerEvents: "none", opacity: 0.4 }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                ></i>
              </span>
              <input
                type="submit"
                id="loginButton"
                value="Submit"
                disabled /* Beta: demo login only (was: loginDisabled) */
              />
              <button
                type="button"
                className="demo-login-button"
                onClick={handleDemoLogin}
                disabled={demoLoading}
              >
                {demoLoading ? "Starting demo..." : "Try as demo user"}
              </button>
              <p className="demo-only-note">
                Logging in works with demo accounts only. Click the button above to try PetPals.
              </p>
              {error && <p className="login-error-message">{error}</p>}
              {/* Beta: password reset is switched off, so the link is hidden
              <p
                className="ForgotPassword"
                id="ForgotPasswordLink"
                onClick={openForgotPasswordPopup}
              >
                Forgot your password?
              </p>
              */}
              {/* Beta: sign up is switched off, demo login only (was: onClick={openSignupPopup}) */}
              <p className="signUp signUp-disabled" id="signUpLink" aria-disabled="true">
                Don't have an account? Sign up
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Forgot Password Popup */}
      <ForgotPassword
        isVisible={forgotPasswordPopupVisible}
        closePopup={closeForgotPasswordPopup}
      />

      {/* Signup Popup */}
      <SignupPopup
        signupPopupVisible={signupPopupVisible}
        closeSignupPopup={closeSignupPopup}
        signupFormData={signupFormData}
        handleSignupInputChange={handleSignupInputChange}
        handleSignupBlur={handleSignupBlur}
        handleSignupSubmit={handleSignupSubmit}
        statusMessage={statusMessage}
        statusType={statusType}
        fieldErrors={fieldErrors}
      />
    </div>
  );
}

export default Login;
