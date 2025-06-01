import { useState, useEffect } from "react";
import axios from "axios";
import logo from "./assets/logo.png";

// Define TypeScript interfaces
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
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<string>("");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Fetch available ingredients on load
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/ingredients")
      .then((res) => setIngredients(res.data))
      .catch((err) => console.error("Error fetching ingredients:", err));
  }, []);

  // Fetch meals when an ingredient is selected
  useEffect(() => {
    if (selectedIngredient) {
      axios
        .get("http://localhost:5000/api/meals?ingredient=" + selectedIngredient)
        .then((res) => setMeals(res.data))
        .catch((err) => console.error("Error fetching meals:", err));
    }
  }, [selectedIngredient]);

  // Fetch recipe when both ingredient and meal are selected
  const fetchRecipe = () => {
    if (selectedMeal) {
      axios
        .get("http://localhost:5000/api/recipe?meal=" + selectedMeal)
        .then((res) => setRecipe(res.data))
        .catch((err) => console.error("Error fetching recipe:", err));
    }
  };

  return (
    <div
      className="container py-5"
      style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}
    >
      <div className="text-center mb-4">
        <img
          src={logo}
          alt="Find a Recipe"
          style={{ maxWidth: "400px", height: "auto" }}
        />
      </div>

      <div className="mb-4">
        <label className="form-label">Choose an Ingredient</label>
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

      <button
        className="btn btn-primary mb-4"
        onClick={fetchRecipe}
        style={{ backgroundColor: "#EFB72E", color: "black", border: "black" }}
        disabled={!selectedIngredient && !selectedMeal}
      >
        Let's Cook!🔥
      </button>
      {recipe && (
        <>
          <div className="card">
            <div className="row g-0">
              <div className="col-md-8">
                <div className="card-body">
                  <h4 className="card-title">{recipe.title}</h4>
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

              {/* Right: Image */}
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

          {/* Image Modal */}
          {showImageModal && (
            <div
              className="modal fade show"
              style={{
                display: "block",
                backgroundColor: "rgba(0,0,0,0.8)",
              }}
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
