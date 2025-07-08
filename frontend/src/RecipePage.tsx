import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "./assets/logo.png";
import { getToken } from "./utils/auth";

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
  const [isFavourited, setIsFavourited] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const endpoint = id
          ? `http://localhost:5000/api/recipe?meal=${id}`
          : `http://localhost:5000/api/recipe`;
        const res = await axios.get(endpoint);
        setRecipe(res.data);

        // Check favourite status if logged in
        if (getToken() && id) {
          const favRes = await axios.get(
            "http://localhost:5000/api/favourites",
            {
              headers: { Authorization: `Bearer ${getToken()}` },
            }
          );
          setIsFavourited(favRes.data.includes(parseInt(id)));
        }
      } catch (err) {
        setError("FAILED TO LOAD RECIPE :(");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleFavouriteToggle = async () => {
    if (!getToken()) {
      alert("Login/Signup to save your favourite recipes!");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/favourites",
        { idMeal: id },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      setIsFavourited((prev) => !prev);
    } catch (error) {
      console.error("Failed to update favourites", error);
    }
  };

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

      <img src={recipe.image} alt={recipe.title} className="img-fluid mb-3" />

      <div className="mb-4">
        <button
          className={`btn ${
            isFavourited ? "btn-danger" : "btn-outline-primary"
          }`}
          onClick={handleFavouriteToggle}
        >
          {isFavourited ? "Remove from Favourites ❤️" : "Add to Favourites 🤍"}
        </button>
      </div>

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
