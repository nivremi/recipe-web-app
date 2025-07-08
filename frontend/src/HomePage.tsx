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

interface Recipe {
  title: string;
  description: string;
  time: string;
  ingredients: string[];
  steps: string[];
  image: string;
}

export default function HomePage() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<string>("");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isFavourited, setIsFavourited] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"ingredient" | "cuisine">(
    "ingredient"
  );
  const navigate = useNavigate();

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
        .get("http://localhost:5000/api/meals?ingredient=" + selectedIngredient)
        .then((res) => setMeals(res.data))
        .catch((err) => console.error("Error fetching meals:", err));
    } else if (selectedArea) {
      axios
        .get("http://localhost:5000/api/cuisine?area=" + selectedArea)
        .then((res) => setMeals(res.data))
        .catch((err) => console.error("Error fetching cuisine:", err));
    }
  }, [selectedIngredient, selectedArea]);

  const fetchRecipe = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/recipe?meal=${selectedMeal}`
      );
      setRecipe(res.data);

      if (getToken()) {
        const favRes = await axios.get("http://localhost:5000/api/favourites", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setIsFavourited(favRes.data.includes(parseInt(selectedMeal)));
      }
    } catch (err) {
      console.error("Error fetching recipe or favourites:", err);
    }
  };

  const fetchRandomRecipe = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/recipe");
    const recipeData = res.data;
    
    // Redirect to RecipePage with the meal ID
    navigate(`/recipe/${recipeData.idMeal}`);
  } catch (err) {
    console.error("Error fetching random recipe:", err);
  }
};

  const toggleFavourite = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/favourites",
        { idMeal: selectedMeal },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      setIsFavourited((prev) => !prev);
    } catch (err) {
      console.error("Error toggling favourite:", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const username = getUser();

  return (
    <div
      className="container py-5"
      style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <img
          src={logo}
          alt="Find a Recipe"
          style={{ maxWidth: "200px", height: "auto" }}
        />
        <div>
          {getToken() ? (
            <>
              <button
                className="btn btn-outline-danger me-2"
                onClick={handleLogout}
              >
                Logout
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate("/favourites")}
              >
                Favourites
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-outline-primary me-2"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate("/signup")}
              >
                Sign Up
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

      <div className="mb-4">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "ingredient" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("ingredient");
                setSelectedIngredient("");
                setSelectedArea("");
                setMeals([]);
                setSelectedMeal("");
                setRecipe(null);
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
                setRecipe(null);
              }}
            >
              By Cuisine
            </button>
          </li>
        </ul>

        <div className="mt-3">
          {activeTab === "ingredient" ? (
            <div>
              <label className="form-label">Select an Ingredient</label>
              <select
                className="form-select"
                value={selectedIngredient}
                onChange={(e) => {
                  setSelectedIngredient(e.target.value);
                  setMeals([]);
                  setSelectedMeal("");
                  setRecipe(null);
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
            <div>
              <label className="form-label">Select a Cuisine</label>
              <select
                className="form-select"
                value={selectedArea}
                onChange={(e) => {
                  setSelectedArea(e.target.value);
                  setMeals([]);
                  setSelectedMeal("");
                  setRecipe(null);
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
        </div>
      </div>

      {meals.length > 0 && (
        <div className="mb-4">
          <label className="form-label">Choose a Meal</label>
          <select
            className="form-select"
            value={selectedMeal}
            onChange={(e) => {
              setSelectedMeal(e.target.value);
              setRecipe(null);
            }}
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
          Let's Cook!🔥
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

      {recipe && (
        <>
          <div className="card">
            <div className="row g-0">
              <div className="col-md-8">
                <div className="card-body">
                  <h4 className="card-title d-flex justify-content-between">
                    {recipe.title}
                    {getToken() && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={toggleFavourite}
                      >
                        {isFavourited ? "❤️ Favourited" : "🤍 Favourite"}
                      </button>
                    )}
                  </h4>
                  <p className="card-text">{recipe.description}</p>
                  <p>
                    <strong>Time/Origin:</strong> {recipe.time}
                  </p>
                  <p>
                    <strong>Ingredients:</strong>
                  </p>
                  <ul>
                    {recipe.ingredients.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <p>
                    <strong>Instructions:</strong>
                  </p>
                  <ol>
                    {recipe.steps
                      .filter((step) => step)
                      .map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                  </ol>
                </div>
              </div>
              <div className="col-md-4">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="img-fluid h-100 rounded-end"
                  style={{ objectFit: "cover", cursor: "pointer" }}
                  onClick={() => setShowImageModal(true)}
                />
              </div>
            </div>
          </div>

          {showImageModal && (
            <div
              className="modal fade show"
              style={{ display: "block", backgroundColor: "rgba(0,0,0,0.8)" }}
              onClick={() => setShowImageModal(false)}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content bg-transparent border-0">
                  <img
                    src={recipe.image}
                    alt="Full"
                    className="img-fluid rounded"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
