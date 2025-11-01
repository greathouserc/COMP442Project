from enum import Enum
from typing import Any, Sequence, Tuple, List
from datetime import date

from sqlalchemy.orm import Mapped, mapped_column, relationship
from marshmallow_sqlalchemy.fields import Nested

from app import db, ma
from app.auth.models import User, UserSchema

################################################################################
# Core Database Model Classes
################################################################################

def init_app_db():
    """Initialize database tables and add any default entries"""
    # completely drop all tables and re-create them from schemas
    db.drop_all()
    db.create_all()
    # create a testing account at app launch
    admin = User(email='test@gcc.edu', password='reallygoodpassword') # type: ignore
    db.session.add(admin)
    db.session.commit()
    
