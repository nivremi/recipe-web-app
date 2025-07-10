import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "./assets/logo.png";
import { getToken } from "./utils/auth";

interface Recipe {
  id: string;
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

        const res = await axios.get(endpoint, {withCredentials: true});
        setRecipe(res.data);

        // Check favourite status if logged in
        if (getToken() && res.data?.id) {
          const favRes = await axios.get(
            "http://localhost:5000/api/favourites",
            {
              headers: { Authorization: `Bearer ${getToken()}` },
            }
          );
          setIsFavourited(favRes.data.includes(parseInt(res.data.id)));
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
        { idMeal: recipe?.id },
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
        onClick={() => navigate("/")}
        style={{
          maxWidth: "250px",
          height: "auto",
          cursor: "pointer",
        }}
      />

      <button className="btn btn-secondary mb-3" onClick={() => navigate("/")}>
        ← Back to Home
      </button>

      <h1>{recipe.title}</h1>

      {/* Image + Info Row */}
      <div className="row mb-4">
        {/* Left Column: Image + Favourite Button */}
        <div
          className="col-md-6 d-flex flex-column justify-content-between"
          style={{ maxHeight: "500px" }}
        >
          <img
            src={recipe.image}
            alt={recipe.title}
            className="img-fluid"
            style={{
              objectFit: "cover",
              maxHeight: "450px",
              borderRadius: "10px",
            }}
          />
          <div className="mt-3">
            <button
              className="btn w-100"
              onClick={handleFavouriteToggle}
              style={{
                backgroundColor: isFavourited ? "#E63E32" : "#EFB72E",
                color: "black",
              }}
            >
              {isFavourited
                ? "Remove from Favourites 🤍"
                : "Add to Favourites 📌"}
            </button>
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="col-md-6">
          <p>
            <strong>Category:</strong> {recipe.description}
          </p>
          <p>
            <strong>Area:</strong> {recipe.time}
          </p>

          <h4>Ingredients</h4>
          <div
            style={{
              maxHeight: "450px",
              overflowY: "auto",
              paddingRight: "10px",
              border: "1px solid #dee2e6",
              borderRadius: "6px",
              padding: "10px",
            }}
          >
            <ul className="list-unstyled mb-0">
              {recipe.ingredients.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4">
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
