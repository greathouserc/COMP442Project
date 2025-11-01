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

# define Model for Banks table
class Project(db.Model):
    __tablename__ = 'Projects'
    order_no: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[str] = mapped_column(nullable=False)
    totalCost: Mapped[float] = mapped_column(nullable=False)
    components: Mapped[List['Component']] = relationship(viewonly=True)

# define Model for Customers table
class Customer(db.Model):
    __tablename__ = 'Customers'
    c_number:   Mapped[int] = mapped_column(primary_key=True)
    name:       Mapped[str] = mapped_column(nullable=False)
    phone:      Mapped[str] = mapped_column(nullable=False)
    email:      Mapped[str] = mapped_column(nullable=False)
    address:    Mapped[str] = mapped_column(nullable=False)
    project_id: Mapped[int] = mapped_column(db.ForeignKey('Projects.order_no'))
    project:   Mapped['Project'] = relationship()
    
# define Model for Banks table
class Component(db.Model):
    __tablename__ = 'Components'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[str] = mapped_column(nullable=False)
    price: Mapped[float] = mapped_column(nullable=False)
    type: Mapped[str] = mapped_column(nullable=False)
    project_id: Mapped[int] = mapped_column(db.ForeignKey('Projects.order_no'))
    project: Mapped['Project'] = relationship()


################################################################################
# JSON Schemas for Core Database Models
################################################################################

# TODO: define accompanying Marshmallow JSON schemas here to support REST API

################################################################################
# Utility Functions for Basic Database Tasks
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
    
