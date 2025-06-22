from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user
from werkzeug.security import generate_password_hash, check_password_hash
from ..models import User
from ..__init__ import db
from .__init__ import auth_bp


@auth_bp.route("/login", methods=["GET"])
def login():
    return render_template("login.html")

@auth_bp.route("/login", methods=["POST"])
def login_post():
    username = request.form.get("username")
    password = request.form.get("password")
    query_username = User.query.filter_by(name=username).first()
    if not query_username or not check_password_hash(query_username.password, password):
        flash("Invaid login credentials, try again")
        return redirect(url_for("auth.login"))

    login_user(query_username)
    return redirect(url_for("profile.home"))

@auth_bp.route("/sign-up", methods=["GET"])
def signup():
    return render_template("sign-up.html")

@auth_bp.route("/sign-up", methods=["POST"])
def signup_post():
    email = request.form.get("email")
    username = request.form.get("username")
    password = request.form.get("password")

    query_email = User.query.filter_by(email=email).first()
    query_user = User.query.filter_by(name=username).first()

    if query_email or query_user:
        if query_email:
            flash("Email address already registered")
        else:
            flash("Username is taken")
        return redirect(url_for("auth.signup"))
    
    new_user = User(email=email, name=username, password=generate_password_hash(password,method="scrypt"))

    db.session.add(new_user)
    db.session.commit()

    return redirect(url_for("auth.login"))


@auth_bp.route("/logout")
def logout():
    return "Logout"