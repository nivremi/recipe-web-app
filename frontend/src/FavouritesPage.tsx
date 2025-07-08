import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "./utils/auth";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";

interface MealCard {
  id: string;
  name: string;
  image: string;
}

export default function FavouritesPage() {
  const [favourites, setFavourites] = useState<MealCard[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchFavourites() {
      try {
        const res = await axios.get("http://localhost:5000/api/favourites", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const favouriteIds = res.data;

        const recipes = await Promise.all(
          favouriteIds.map(async (id: number) => {
            const recipeRes = await axios.get(
              `http://localhost:5000/api/recipe?meal=${id}`
            );
            const meal = recipeRes.data;
            return {
              id: id.toString(),
              name: meal.title,
              image: meal.image,
            };
          })
        );
        setFavourites(recipes);
      } catch (err) {
        console.error("Error loading favourites:", err);
      }
    }
    fetchFavourites();
  }, []);

  const handleClick = (id: string) => {
    navigate(`/recipe/${id}`);
  };

  const removeFromFavourites = async (id: string) => {
    console.log("Unfavouriting id:", id);
    try {
      await axios.post(
        "http://localhost:5000/api/favourites",
        { idMeal: id },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      setFavourites((prev) => prev.filter((meal) => meal.id !== id));
    } catch (err) {
      console.error("Failed to unfavourite:", err);
    }
  };

  return (
    <div className="container py-5">
      <img
          src={logo}
          alt="Find a Recipe"
          style={{ maxWidth: "200px", height: "auto" }}
        />
      <h2 className="mb-4 text-center"> Your Favourite Recipes </h2>
      {/* Back button */}
      <button
        className="btn btn-secondary mb-3"
        onClick={() => navigate("/")}
        type="button"
      >
        ← Back to Home
      </button>
      <div className="row">
        {favourites.map((meal) => (
          <div className="col-md-4 mb-4" key={meal.id}>
            <div
              className="card h-100"
              style={{ cursor: "pointer", position: "relative" }}
            >
              <img
                src={meal.image}
                className="card-img-top"
                alt={meal.name}
                style={{ objectFit: "cover", height: "200px" }}
                onClick={() => handleClick(meal.id)}
              />
              <div className="card-body">
                <h5 className="card-title" onClick={() => handleClick(meal.id)}>
                  {meal.name}
                </h5>
                {/* Unfavourite button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevent triggering card click
                    removeFromFavourites(meal.id);
                  }}
                  className="btn btn-sm btn-danger"
                  style={{ position: "absolute", top: "10px", right: "10px" }}
                  aria-label="Remove from favourites"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
