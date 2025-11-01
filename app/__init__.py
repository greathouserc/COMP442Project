from config import Config
from flask import Flask
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

db = SQLAlchemy()
ma = Marshmallow()

def create_app(config=Config):
    # create the flask app and set all its config options based on a config object
    flask_app = Flask(__name__)
    flask_app.config.from_object(config)
    # connect the core endpoints without a prefix
    from app.core import bp as core_bp
    flask_app.register_blueprint(core_bp, url_prefix='')
    # connect the authentication endpoints under the prefix /auth
    from app.auth import bp as auth_bp
    flask_app.register_blueprint(auth_bp, url_prefix='/auth')
    # register the database models
    db.init_app(flask_app)
    # import utility functions for database setup
    from app.core.models import init_app_db
    # refresh the database creating tables and default data
    with flask_app.app_context(): init_app_db()
    # register the marshmallow model JSON schemas
    ma.init_app(flask_app)
    # connect the api endpoints under the prefix /api
    from app.api import bp as api_bp
    flask_app.register_blueprint(api_bp, url_prefix='/api')
    # set up Flask-Login for the whole application
    from app.auth.models import User
    login_manager = LoginManager()
    login_manager.init_app(flask_app)
    login_manager.login_view = 'auth.get_login' # type: ignore
    login_manager.session_protection = 'strong'
    @login_manager.user_loader
    def load_user(uid: int) -> User|None:
        return User.query.get(int(uid))
    # return the manufactured Flask application
    return flask_app
