import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { getToken, getUser, logout } from "../utils/auth";

export default function TopBar() {
  const navigate = useNavigate();
  const username = getUser();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
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

      <div className="d-flex gap-2 flex-wrap justify-content-end">
        {getToken() ? (
          <>
            <button
              className="btn"
              onClick={() => navigate("/favourites")}
              style={{
                backgroundColor: "#EFB72E",
                color: "black",
              }}
            >
              <i className="bi bi-bookmark-fill me-2"></i> Favourites
            </button>
            <button
              className="btn"
              onClick={handleLogout}
              style={{
                backgroundColor: "#E63E32",
                color: "black",
              }}
            >
              <i className="bi bi-box-arrow-right me-2"></i> Logout
            </button>
          </>
        ) : (
          <>
            <button
              className="btn"
              onClick={() => navigate("/signup")}
              style={{
                backgroundColor: "#EFB72E",
                color: "black",
              }}
            >
              <i className="bi bi-pencil-square me-2"></i> Sign Up
            </button>
            <button
              className="btn"
              onClick={() => navigate("/login")}
              style={{
                backgroundColor: "#2196F3",
                color: "black",
              }}
            >
              <i className="bi bi-person-circle me-2"></i> Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
