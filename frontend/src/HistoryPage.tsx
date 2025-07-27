import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import TopBar from "./components/TopBar";

interface Meal {
  id: string;
  title: string;
  image: string;
  timestamp: number;
}

function timeAgo(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp * 1000;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return `Last viewed ${diffSec} seconds ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Last viewed ${diffMin} minutes ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `Last viewed ${diffHrs} hours ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `Last viewed ${diffDays} days ago`;
}

export default function HistoryPage() {
  const [historyMeals, setHistoryMeals] = useState<Meal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/history", {
        withCredentials: true,
      });

      const historyEntries: { id: number; timestamp: number }[] = res.data;

      const promises = historyEntries.map(({ id, timestamp }) =>
        axios
          .get(`http://localhost:5000/api/recipe?meal=${id}`)
          .then((res) => ({
            id: res.data.id,
            title: res.data.title,
            image: res.data.image,
            timestamp,
          }))
      );

      const meals = await Promise.all(promises);
      setHistoryMeals(meals);
      setError(null); // Clear error on success
    } catch (err: any) {
      console.error("Failed to fetch history", err);
      setError(null); // We don't want to show an error in this case, treat as empty
      setHistoryMeals([]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    try {
      await axios.post("http://localhost:5000/api/history/clear", null, {
        withCredentials: true,
      });
      setHistoryMeals([]); // Clear UI as well
      setError(null);
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  return (
    <div className="container py-5">
      <TopBar />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 text-center flex-grow-1">
          🍴 Your Viewed Recipe History
        </h2>
        {historyMeals.length > 0 && (
          <button
            className="btn btn-outline-danger ms-3"
            onClick={handleClearHistory}
          >
            Clear History
          </button>
        )}
      </div>

      {/* Show error only if error exists and meals list is empty */}
      {error && historyMeals.length === 0 && (
        <p className="text-danger">{error}</p>
      )}

      {/* Show meals if exist */}
      {historyMeals.length > 0 ? (
        <div className="row">
          {historyMeals.map((meal) => (
            <div
              key={meal.id}
              className="col-md-4 mb-4"
              onClick={() => navigate(`/recipe/${meal.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="card h-100">
                <img
                  src={meal.image}
                  className="card-img-top"
                  alt={meal.title}
                  style={{ objectFit: "cover", height: "200px" }}
                />
                <div className="card-body">
                  <h5 className="card-title">{meal.title}</h5>
                  <small className="text-muted">
                    {timeAgo(meal.timestamp)}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Friendly message with "something" as clickable link to random recipe
        <p className="text-muted text-center">
          No recently viewed recipe...how about we begin with{" "}
          <Link to="/recipe" style={{ textDecoration: "underline" }}>
            something
          </Link>
          ?
        </p>
      )}
    </div>
  );
}
