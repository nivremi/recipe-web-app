import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface MealDBRecipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
}

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<MealDBRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const res = await axios.get(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        );
        const meals = res.data.meals;
        if (meals && meals.length > 0) {
          setRecipe(meals[0]);
        } else {
          setError("Recipe not found");
        }
      } catch (err) {
        setError("Failed to load recipe");
      } finally {
        setLoading(false);
      }
    }
    fetchRecipe();
  }, [id]);

  if (loading) return <p>Loading recipe...</p>;
  if (error) return <p>{error}</p>;
  if (!recipe) return <p>No recipe found.</p>;

  return (
    <div className="container py-5">
      <h1>{recipe.strMeal}</h1>
      <img
        src={recipe.strMealThumb}
        alt={recipe.strMeal}
        style={{ maxWidth: "100%", height: "auto" }}
      />

      <div className="mt-4">
        <h3>Instructions</h3>
        <p style={{ whiteSpace: "pre-line" }}>{recipe.strInstructions}</p>
      </div>
    </div>
  );
}
