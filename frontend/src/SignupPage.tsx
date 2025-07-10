import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="container py-5">
      <img
        src={logo}
        alt="Find a Recipe"
        onClick={() => navigate("/")}
        style={{
          maxWidth: "250px",
          height: "auto",
          cursor: "pointer",
        }}
      />

      <h2 className="mb-4 text-center">Sign Up</h2>
      <button
        className="btn btn-secondary mb-3"
        onClick={() => navigate("/")}
        type="button"
      >
        ← Back to Home
      </button>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSignup}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Re-enter Password</label>
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {confirmPassword && password !== confirmPassword && (
          <div className="text-danger mb-3">Passwords do not match</div>
        )}
        <button
          className="btn btn-primary"
          type="submit"
          disabled={password !== confirmPassword}
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
