import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Pokeball from "./Pokeball";

function Login({ onLogin, setFavorites }) {
  const [showLogin, setShowLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function switchMode(login) {
    setShowLogin(login);
    setErrors([]);
  }

  function finishLogin(user) {
    onLogin(user);
    // Load this account's favorites now that the session cookie is set.
    fetch("/api/v1/user_favorites").then((r) => {
      if (r.ok) r.json().then((data) => setFavorites(data));
    });
    navigate("/");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    const path = showLogin ? "/api/v1/login" : "/api/v1/signup";
    const body = showLogin
      ? { username, password }
      : { username, password, password_confirmation: passwordConfirmation };

    fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => {
        if (r.ok) {
          r.json().then(finishLogin);
        } else {
          r.json().then((err) => setErrors(err.errors || ["Something went wrong"]));
        }
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <Pokeball size={56} className="login-ball" />
        <h1 className="login-title">{showLogin ? "Welcome back, trainer!" : "Start your journey"}</h1>
        <p className="login-sub">
          {showLogin
            ? "Log in to race and battle with your favorites."
            : "Create an account to build your team of favorites."}
        </p>

        <div className="login-tabs">
          <button
            className={`login-tab${showLogin ? " active" : ""}`}
            onClick={() => switchMode(true)}
          >
            Login
          </button>
          <button
            className={`login-tab${!showLogin ? " active" : ""}`}
            onClick={() => switchMode(false)}
          >
            Sign up
          </button>
        </div>

        <form id={showLogin ? "login-form" : "signup-form"} onSubmit={handleSubmit}>
          <input
            type="text"
            id="username-input"
            autoComplete="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            id="password-input"
            autoComplete={showLogin ? "current-password" : "new-password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {!showLogin && (
            <input
              type="password"
              id="signup-password_confirmation"
              autoComplete="new-password"
              placeholder="Confirm password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          )}
          <button className="btn btn-primary login-submit" type="submit" disabled={submitting}>
            {showLogin ? "Login" : "Sign up"}
          </button>

          {errors.length > 0 && (
            <div className="errors">
              {errors.map((err) => (
                <p key={err}>{err}</p>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
