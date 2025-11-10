from enum import Enum
from typing import Any, Sequence, Tuple, List
from datetime import date

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy_utils import database_exists
from marshmallow_sqlalchemy.fields import Nested

from app import db, ma
from app.auth.authmodels import User, UserSchema
import os
from config import default_db_path

def init_app_db():
    """Initialize database tables and add any default entries"""
    # completely drop all tables and re-create them from schemas
    if 'DATABASE_PATH' in os.environ:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.abspath(os.environ['DATABASE_PATH'])}"
    else:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{default_db_path}"
    if not database_exists(SQLALCHEMY_DATABASE_URI):
        db.drop_all()
        db.create_all()
        # create a testing account at app launch
        admin = User(email='test@gcc.edu', password='reallygoodpassword') # type: ignore
        db.session.add(admin)
        db.session.commit()
    
