from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
DB_NAME = "db.sqlite"

jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = "a"
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_NAME}"

    db.init_app(app)
    
    from .models import User
    with app.app_context():
        db.create_all()

    CORS(app, supports_credentials=True, origins=["http://localhost:3001"])

    app.config["JWT_SECRET_KEY"] = "a"
    jwt.init_app(app)


    login_manager = LoginManager()
    login_manager.login_view = "auth.login"
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    from .api.__init__ import api_bp
    app.register_blueprint(api_bp)

    from .auth.__init__ import auth_bp
    app.register_blueprint(auth_bp)

    from .profile.__init__ import profile_bp
    app.register_blueprint(profile_bp)

    return app