from flask import Flask, render_template, jsonify, request
import requests

app = Flask(__name__)

@app.route("/")
def index():
    ingredients = sorted(get_ingredients())
    
    return render_template("choose-ingredient.html", ingredients=ingredients)

@app.route("/get-ingredients", methods=["POST"])
def get_ingredients():
    api_url = "https://www.themealdb.com/api/json/v1/1/list.php?i=list"
    response = requests.get(api_url)
    response.raise_for_status()
    data = response.json()

    ingredients = []
    for i in range(len(data["meals"])):
        ingredients.append(data["meals"][i]["strIngredient"])
    return ingredients

@app.route("/get-meals", methods=["POST"])
def get_meals():
    ingredient = request.form.get("ingredient")
    print(ingredient)
    api_url = "https://www.themealdb.com/api/json/v1/1/filter.php?i=" + ingredient
    response = requests.get(api_url)
    response.raise_for_status()
    data = response.json()["meals"]
    print(data)
    return render_template("choose-meal.html", meals=data)

@app.route("/get-recipe", methods=["POST"])
def get_recipe():
    meal = request.form.get("idMeal")
    api_url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + meal
    response = requests.get(api_url)
    response.raise_for_status()
    data = response.json()["meals"][0]
    return render_template("display-meal.html", keys=data.keys(), meals=data)

if __name__ == "__main__":
    app.run(debug=True)
