from flask import jsonify, request, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
import re
import json
import time
from .__init__ import api_bp
from ..__init__ import db
from ..models import User


def format_recipe(data):
    """Format a mealDB recipe into a cleaner structure."""
    ingredients = []
    for i in range(1, 21):
        ingredient = data.get(f"strIngredient{i}")
        measure = data.get(f"strMeasure{i}")
        if ingredient and ingredient.strip():
            ingredients.append(f"{measure.strip()} {ingredient.strip()}")

    raw_instructions = (data.get("strInstructions") or "").replace("\r\n", "\n")
    steps = [
        re.sub(r"^\s*\d+\.\s*", "", line).strip()
        for line in raw_instructions.split("\n")
        if line.strip()
    ]

    return jsonify({
        "id": data["idMeal"],
        "title": data["strMeal"],
        "description": data.get("strCategory", ""),
        "time": data.get("strArea", ""),
        "ingredients": ingredients,
        "steps": steps,
        "image": data.get("strMealThumb")
    })


@api_bp.route("/ingredients", methods=["GET"])
def list_ingredients():
    response = requests.get("https://www.themealdb.com/api/json/v1/1/list.php?i=list")
    response.raise_for_status()
    data = response.json()

    return jsonify([item["strIngredient"] for item in data["meals"]])


@api_bp.route("/meals", methods=["GET"])
def meals_by_ingredient():
    ingredient = request.args.get("ingredient")
    response = requests.get(f"https://www.themealdb.com/api/json/v1/1/filter.php?i={ingredient}")
    response.raise_for_status()
    meals = response.json().get("meals", [])

    return jsonify([{"name": m["strMeal"], "id": m["idMeal"]} for m in meals])


@api_bp.route("/area", methods=["GET"])
def list_areas():
    response = requests.get("https://www.themealdb.com/api/json/v1/1/list.php?a=list")
    response.raise_for_status()
    data = response.json()

    return jsonify([item["strArea"] for item in data["meals"]])


@api_bp.route("/cuisine", methods=["GET"])
def meals_by_area():
    area = request.args.get("area")
    response = requests.get(f"https://www.themealdb.com/api/json/v1/1/filter.php?a={area}")
    response.raise_for_status()
    meals = response.json().get("meals", [])

    return jsonify([{"name": m["strMeal"], "id": m["idMeal"]} for m in meals])


@api_bp.route("/recipe", methods=["GET"])
def fetch_recipe():
    meal_id = request.args.get("meal")
    api_url = (
        f"https://www.themealdb.com/api/json/v1/1/lookup.php?i={meal_id}"
        if meal_id else
        "https://www.themealdb.com/api/json/v1/1/random.php"
    )

    response = requests.get(api_url)
    response.raise_for_status()
    data = response.json()["meals"][0]

    return store_viewed_meal(data["idMeal"], format_recipe(data))


@api_bp.route("/history", methods=["GET"])
def get_view_history():
    raw_cookie = request.cookies.get("meal_history")
    if not raw_cookie:
        return {"msg": "View a meal to add to history"}, 404

    try:
        history = json.loads(raw_cookie)
        if isinstance(history, list) and all(isinstance(i, dict) and "id" in i and "timestamp" in i for i in history):
            return jsonify(history)
        else:
            return {"msg": "Malformed Cookies"}, 200
    except Exception:
        return {"msg": "Invalid Cookie Format"}, 400


def store_viewed_meal(meal_id, response_data):
    """Updates meal_history cookie with the new meal view."""
    prev_cookie = get_view_history()
    history = prev_cookie[0] if isinstance(prev_cookie, tuple) else prev_cookie.get_json()

    if not isinstance(history, list):
        history = []

    history = [entry for entry in history if entry["id"] != int(meal_id)]
    history.insert(0, {"id": int(meal_id), "timestamp": int(time.time())})
    history = history[:9]

    response = make_response(response_data)
    response.set_cookie("meal_history", json.dumps(history), max_age=3600, path="/")
    return response

@api_bp.route("/history/clear", methods=["POST"])
def clear_history():
    response = make_response({"msg": "History cleared"})
    response.set_cookie("meal_history", "", max_age=0, path="/")  # Delete the cookie
    return response


@api_bp.route("/favourites", methods=["GET"])
@jwt_required()
def get_user_favourites():
    user = User.query.filter_by(name=get_jwt_identity()).first()
    if not user or not user.favourited:
        return jsonify([])

    return jsonify([int(mid) for mid in user.favourited.split(",") if mid.strip()])


@api_bp.route("/favourites", methods=["POST"])
@jwt_required()
def toggle_favourite():
    meal_id = request.json.get("idMeal")
    if not meal_id:
        return {"msg": "Meal not found"}, 404

    user = User.query.filter_by(name=get_jwt_identity()).first()
    favs = user.favourited.split(",") if user.favourited else []

    meal_str = str(meal_id)
    if meal_str in favs:
        favs.remove(meal_str)
    else:
        favs.append(meal_str)

    user.favourited = ",".join(favs)
    db.session.commit()

    return {"msg": "Success"}, 200