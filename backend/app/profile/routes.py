from flask import render_template
from flask_login import login_required, current_user
from .__init__ import profile_bp

@profile_bp.route("/home", methods=["GET"])
@login_required
def home():
    return render_template("profile.html", name=current_user.name)
