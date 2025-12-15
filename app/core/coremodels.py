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

    
# class Properties(db.Model):
#     __tablename__ = "Properties"
#     name: Mapped[str] = mapped_column(nullable=True)
#     formal: Mapped[str] = mapped_column(nullable=True)
#     address_line1: Mapped[str] = mapped_column(nullable=True)
#     address_line2: Mapped[str] = mapped_column(nullable=True)
#     user: Mapped[str] = mapped_column(db.ForeignKey('Users.email'))
#     def __str__(self):
#         return f"Location(id={self.id})"
    
# class Geometry(db.Model):
#     __tablename__ = "Geometry"
#     type: Mapped[str] = "True"
#     coordinates: Mapped[List] = mapped_column(nullable=False)

# class Location(db.Model):
#     __tablename__ = "Locations"
#     id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
#     properties: Mapped[Properties]
#     geometry: Mapped[Geometry]
    
#     def __str__(self):
#         return f"Location(id={self.id})"

class Location(db.Model):
    __tablename__ = "Locations"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(nullable=True)
    formal: Mapped[str] = mapped_column(nullable=True)
    address_line1: Mapped[str] = mapped_column(nullable=True)
    address_line2: Mapped[str] = mapped_column(nullable=True)
    latitude: Mapped[float] = mapped_column(nullable=False)
    longitude: Mapped[float] = mapped_column(nullable=False)
    user_id: Mapped[int] = mapped_column(db.ForeignKey('Users.id'))
    def __str__(self):
        return f"Location(id={self.id})"

# class Location(db.Model):
#     __tablename__ = "Locations"
#     id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
#     properties: Mapped[Properties]
#     geometry: Mapped[Geometry]
    
#     def __str__(self):
#         return f"Location(id={self.id})"

class SavedVideo(db.Model):
    __tablename__ = "SavedVideos"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    video_url: Mapped[str] = mapped_column(nullable=False)
    title: Mapped[str] = mapped_column(nullable=True)
    video_type: Mapped[str] = mapped_column(nullable=True)  
    user_id: Mapped[int] = mapped_column(db.ForeignKey('Users.id'))
    def __str__(self):
        return f"SavedVideo(id={self.id}, title={self.title})"

class LocationSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Location
        #load_instance = True # loads a Course instead of a validated dict
        include_fk = False # don't include id
        include_relationships = True
        #sqla_session = db.session # connect this to the db schema

class SavedVideoSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = SavedVideo
        include_fk = False
        include_relationships = True

class ContactGroup(db.Model):
    __tablename__ = "ContactGroup"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(nullable=False)
    desc: Mapped[str] = mapped_column(nullable=False)

class ContactGroupSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = ContactGroup

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
        adminLocation = Location(name = 'UPMC Pediatrics', formal = 'UPMC Pediatrics, Kelly Boulevard, Slippery Rock, PA 16057', address_line1 = 'UPMC Pediatrics', address_line2 = 'Kelly Boulevard, Slippery Rock, PA 16057, United States of America', latitude = 41.07227675, longitude = -80.05449554544492, user_id=admin.id) 
        adminVideo1 = SavedVideo(video_url='MPU9HoVhSp8?si=-LspUYCjTf_TgHUy', title='General Pregnancy Advice', video_type='G', user_id=admin.id) 
        adminVideo2 = SavedVideo(video_url='Jr4nt6XM3gA?si=pmCGFwT5L5mXyAwl', title='Medical Health Tips', video_type='M', user_id=admin.id) 
        db.session.add(adminLocation)
        db.session.add(adminVideo1)
        db.session.add(adminVideo2)
        db.session.commit()
    
