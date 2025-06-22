from flask import Flask, jsonify, request
import requests
import re
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable cross-origin requests from React frontend

@app.route("/api/ingredients", methods=["GET"])
def get_ingredients():
    api_url = "https://www.themealdb.com/api/json/v1/1/list.php?i=list"
    response = requests.get(api_url)
    response.raise_for_status()
    data = response.json()

    ingredients = [item["strIngredient"] for item in data["meals"]]
    return jsonify(ingredients)

@app.route("/api/meals", methods=["GET"])
def get_meals():
    ingredient = request.args.get("ingredient")
    api_url = f"https://www.themealdb.com/api/json/v1/1/filter.php?i={ingredient}"
    response = requests.get(api_url)
    response.raise_for_status()
    data = response.json()["meals"]
    
    # Return list of dicts with name and id
    return jsonify([
        {"name": meal["strMeal"], "id": meal["idMeal"]}
        for meal in data
    ])

@app.route("/api/recipe", methods=["GET"])
def get_recipe():
    meal_id = request.args.get("meal")
    api_url = f"https://www.themealdb.com/api/json/v1/1/lookup.php?i={meal_id}"
    response = requests.get(api_url)
    response.raise_for_status()
    data = response.json()["meals"][0]

    # Collect ingredients and measures
    ingredients = []
    for i in range(1, 21):
        ingredient = data.get(f"strIngredient{i}")
        measure = data.get(f"strMeasure{i}")
        if ingredient and ingredient.strip():
            ingredients.append(f"{measure.strip()} {ingredient.strip()}")

    # Clean and split instructions
    raw_instructions = data["strInstructions"] or ""
    # Replace \r\n with actual line breaks
    raw_instructions = raw_instructions.replace("\r\n", "\n")
    # Split into lines
    lines = raw_instructions.split("\n")
    # Remove leading numbering like "0. ", "1. ", etc.
    cleaned_steps = [re.sub(r"^\s*\d+\.\s*", "", line).strip() for line in lines if line.strip()]

    recipe = {
        "title": data["strMeal"],
        "description": data.get("strCategory", ""),
        "time": data.get("strArea", ""),
        "ingredients": ingredients,
        "steps": cleaned_steps,
        "image" : data.get("strMealThumb")
    }
    return jsonify(recipe)

@app.route("/api/area", methods=["GET"])
def get_area():
    api_url = "https://www.themealdb.com/api/json/v1/1/list.php?a=list"
    response = requests.get(api_url)
    response.raise_for_status()
    data = response.json()
    areas = [item["strArea"] for item in data["meals"]]
    return jsonify(areas)

@app.route("/api/cuisine", methods=["GET"])
def get_cuisine():
    area = request.args.get("area")
    api_url = f"www.themealdb.com/api/json/v1/1/filter.php?a={area}"
    response = requests.get(api_url)
    response.raise_for_status()
    data = response.json()["meals"]
    
    # Return list of dicts with name and id
    return jsonify([
        {"name": meal["strMeal"], "id": meal["idMeal"]}
        for meal in data
    ])

if __name__ == "__main__":
    print(get_cuisine())
    # app.run(debug=True)
