import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);
  const navigate = useNavigate();

  // Email validation regex
  const validateEmail = (email: string) => {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Password validation checks
  const validations = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /\d/.test(password),
    specialChar: /[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]/.test(password),
  };

  const emailValid = validateEmail(email);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) {
      setError("Please enter a valid email address");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:5000/auth/signup", {
        username,
        email,
        password,
      });
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.msg || "Signup failed");
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 500 }}>
      <img
        src={logo}
        alt="Find a Recipe"
        onClick={() => navigate("/")}
        style={{
          maxWidth: "250px",
          height: "auto",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
      />

      <h2 className="mb-4 text-center">Sign Up</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSignup}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            className={`form-control ${
              email && !emailValid ? "is-invalid" : ""
            }`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            required
            type="email"
          />
          {email && !emailValid && (
            <div className="invalid-feedback">
              Please enter a valid email address.
            </div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            className="form-control"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError("");
            }}
            required
          />
        </div>
        <div className="mb-3" style={{ position: "relative" }}>
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
            required
            onFocus={() => setShowPasswordHelp(true)}
            onBlur={() => setShowPasswordHelp(false)}
          />
          {showPasswordHelp && (
            <div
              className="border rounded p-2 mt-1"
              style={{
                backgroundColor: "#f8f9fa",
                fontSize: "0.875rem",
                position: "absolute",
                width: "100%",
                zIndex: 10,
              }}
            >
              <p className="mb-1 fw-bold">Password must have:</p>
              <ul
                className="mb-0"
                style={{ listStyleType: "none", paddingLeft: 0 }}
              >
                <li style={{ color: validations.length ? "green" : "red" }}>
                  {validations.length ? "✔" : "✖"} At least 8 characters
                </li>
                <li style={{ color: validations.uppercase ? "green" : "red" }}>
                  {validations.uppercase ? "✔" : "✖"} One uppercase letter
                </li>
                <li style={{ color: validations.lowercase ? "green" : "red" }}>
                  {validations.lowercase ? "✔" : "✖"} One lowercase letter
                </li>
                <li style={{ color: validations.digit ? "green" : "red" }}>
                  {validations.digit ? "✔" : "✖"} One digit
                </li>
                <li
                  style={{ color: validations.specialChar ? "green" : "red" }}
                >
                  {validations.specialChar ? "✔" : "✖"} One special character
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Re-enter Password</label>
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error) setError("");
            }}
            required
          />
        </div>
        {confirmPassword && password !== confirmPassword && (
          <div className="text-danger mb-3">Passwords do not match</div>
        )}
        <button
          className="btn btn-primary"
          type="submit"
          disabled={
            !emailValid ||
            password !== confirmPassword ||
            !validations.length ||
            !validations.uppercase ||
            !validations.lowercase ||
            !validations.digit ||
            !validations.specialChar
          }
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
