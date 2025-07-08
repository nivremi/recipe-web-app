import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "./assets/logo.png";

interface Recipe {
  title: string;
  description: string;
  time: string;
  ingredients: string[];
  steps: string[];
  image: string;
}

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const endpoint = id
          ? `http://localhost:5000/api/recipe?meal=${id}`
          : `http://localhost:5000/api/recipe`;
        const res = await axios.get(endpoint);
        setRecipe(res.data);
      } catch (err) {
        setError("Failed to load recipe");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  if (loading) return <p>Loading recipe...</p>;
  if (error) return <p>{error}</p>;
  if (!recipe) return <p>No recipe found.</p>;

  return (
    <div className="container py-5">
      <img
        src={logo}
        alt="Find a Recipe"
        style={{ maxWidth: "200px", height: "auto" }}
      />
      <button className="btn btn-secondary mb-3" onClick={() => navigate("/")}>
        ← Back to Home
      </button>
      <h1>{recipe.title}</h1>
      <img src={recipe.image} alt={recipe.title} className="img-fluid mb-4" />

      <p>
        <strong>Category:</strong> {recipe.description}
      </p>
      <p>
        <strong>Area:</strong> {recipe.time}
      </p>

      <div className="mt-4">
        <h4>Ingredients</h4>
        <ul>
          {recipe.ingredients.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <h4>Instructions</h4>
        <ol>
          {recipe.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
