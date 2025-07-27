import { useState, useEffect } from "react";
import axios from "axios";
import logo from "./assets/logo.png";
import banner from "./assets/banner.png";
import { getToken, logout, getUser } from "./utils/auth";
import { useNavigate } from "react-router-dom";

interface Meal {
  id: string;
  name: string;
}

export default function HomePage() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"ingredient" | "cuisine">(
    "ingredient"
  );

  const navigate = useNavigate();
  const username = getUser();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/ingredients")
      .then((res) => setIngredients(res.data))
      .catch((err) => console.error("Error fetching ingredients:", err));

    axios
      .get("http://localhost:5000/api/area")
      .then((res) => setAreas(res.data))
      .catch((err) => console.error("Error fetching areas:", err));
  }, []);

  useEffect(() => {
    if (selectedIngredient) {
      axios
        .get(`http://localhost:5000/api/meals?ingredient=${selectedIngredient}`)
        .then((res) => setMeals(res.data))
        .catch((err) => console.error("Error fetching meals:", err));
    } else if (selectedArea) {
      axios
        .get(`http://localhost:5000/api/cuisine?area=${selectedArea}`)
        .then((res) => setMeals(res.data))
        .catch((err) => console.error("Error fetching cuisine:", err));
    } else {
      setMeals([]);
    }
  }, [selectedIngredient, selectedArea]);

  const fetchRecipe = () => {
    if (selectedMeal) {
      navigate(`/recipe/${selectedMeal}`);
    }
  };

  const fetchRandomRecipe = async () => {
    navigate(`/recipe/`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      className="container py-5"
      style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}
    >
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

      <div
        className="my-4 position-relative text-center"
        style={{
          backgroundImage: `url(${banner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "200px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            padding: "1rem 2rem",
            borderRadius: "8px",
          }}
        >
          <h2
            className="fw-bold m-0"
            style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
          >
            {getToken() && username
              ? `Welcome ${username}, what shall we cook today? 🍽️`
              : "Welcome User! What shall we cook today? 🍽️"}
          </h2>
        </div>
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "ingredient" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("ingredient");
              setSelectedIngredient("");
              setSelectedArea("");
              setMeals([]);
              setSelectedMeal("");
            }}
          >
            By Ingredient
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "cuisine" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("cuisine");
              setSelectedIngredient("");
              setSelectedArea("");
              setMeals([]);
              setSelectedMeal("");
            }}
          >
            By Cuisine
          </button>
        </li>
      </ul>

      {activeTab === "ingredient" ? (
        <div className="mb-4">
          <label className="form-label">Select an Ingredient</label>
          <select
            className="form-select"
            value={selectedIngredient}
            onChange={(e) => {
              setSelectedIngredient(e.target.value);
              setMeals([]);
              setSelectedMeal("");
            }}
          >
            <option value="">-- Select Ingredient --</option>
            {ingredients.map((ing) => (
              <option key={ing} value={ing}>
                {ing}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="mb-4">
          <label className="form-label">Select a Cuisine</label>
          <select
            className="form-select"
            value={selectedArea}
            onChange={(e) => {
              setSelectedArea(e.target.value);
              setMeals([]);
              setSelectedMeal("");
            }}
          >
            <option value="">-- Select Cuisine --</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
      )}

      {meals.length > 0 && (
        <div className="mb-4">
          <label className="form-label">Choose a Meal</label>
          <select
            className="form-select"
            value={selectedMeal}
            onChange={(e) => setSelectedMeal(e.target.value)}
          >
            <option value="">-- Select Meal --</option>
            {meals.map((meal) => (
              <option key={meal.id} value={meal.id}>
                {meal.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4 text-center">
        <div className="mb-2">
          <button
            className="btn btn-primary me-2"
            onClick={fetchRecipe}
            style={{
              backgroundColor: "#EFB72E",
              color: "black",
              border: "black",
            }}
            disabled={!selectedMeal}
          >
            Let's Cook! 🔥
          </button>
          <button
            className="btn btn-primary"
            onClick={fetchRandomRecipe}
            style={{
              backgroundColor: "#65C174",
              color: "black",
              border: "black",
            }}
          >
            Surprise Me! ✨
          </button>
        </div>

        {getToken() ? (
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/history")}
            style={{
              backgroundColor: "#f0ad4e",
              color: "black",
              border: "black",
            }}
          >
            🍽️ View your history
          </button>
        ) : (
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/login")}
            style={{
              backgroundColor: "#f0ad4e",
              color: "black",
              border: "black",
            }}
          >
            🔒 Login to view your history
          </button>
        )}
      </div>
    </div>
  );
}
