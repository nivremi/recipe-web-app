import { useState } from "react";
import axios from "axios";
import { saveToken, saveUser } from "./utils/auth";
import { useNavigate, Link } from "react-router-dom";
import logo from "./assets/logo.png";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/auth/token", {
        username,
        password,
      });
      saveToken(res.data.access_token);
      saveUser(username);
      navigate("/");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="container py-5">
      <img
          src={logo}
          alt="Find a Recipe"
          style={{ maxWidth: "200px", height: "auto" }}
        />
      <h2 className="mb-4 text-center">Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Back button */}
      <button
        className="btn btn-secondary mb-3"
        onClick={() => navigate("/")}
        type="button"
      >
        ← Back to Home
      </button>

      <form onSubmit={handleLogin}>
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
        <button className="btn btn-primary" type="submit">
          Login
        </button>
      </form>

      {/* Signup prompt */}
      <p className="mt-3">
        Not a user yet? Sign up{" "}
        <Link
          to="/signup"
          style={{
            textDecoration: "underline",
            fontWeight: "bold",
            color: "#0d6efd",
          }}
        >
          here
        </Link>
      </p>
    </div>
  );
}
