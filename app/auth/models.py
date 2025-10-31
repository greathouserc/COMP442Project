import base64
from flask import current_app
from flask_login import UserMixin
from sqlalchemy.orm import Mapped, mapped_column
from cryptography.fernet import Fernet
from passlib.hash import argon2
from app import db, ma

class User(UserMixin, db.Model):
    __tablename__ = "Users"
    id:    Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(nullable=False)
    password_hash: Mapped[bytes] = mapped_column(nullable=False)

    @property
    def pepper(self) -> Fernet:
        """Get the global pepper encryption system to encrypt hashes"""
        if not hasattr(self, '_pepper') or not isinstance(self._pepper, Fernet):
            self._pepper = Fernet(base64.urlsafe_b64encode(current_app.config['PEPPER']))
        return self._pepper

    @property
    def password(self) -> str:
        raise AttributeError("password is a write-only attribute")
    @password.setter
    def password(self, new_password: str) -> None:
        """Hash the user's password using Argon2i and encrypt it with an AES-128 pepper"""
        # hash the password using Argon2i (automatically includes hasher info and random salt in the hash string)
        pwd_hash: str = argon2.using(rounds=10).hash(new_password)
        # convert this utf-8 password hash string into bytes
        pwd_hash_bytes: bytes = pwd_hash.encode('utf-8')
        # encrypt the password hash using the global pepper
        encrypted_pwd_hash: bytes = self.pepper.encrypt(pwd_hash_bytes)
        # store this encrypted hash in the password hash attribute
        self.password_hash = encrypted_pwd_hash
    
    def verify_password(self, given_password: str) -> bool:
        """Check if the given password string is consistent with the stored hash"""
        # decrypt the stored password hash
        pwd_hash_bytes: bytes = self.pepper.decrypt(self.password_hash)
        # decode the utf-8 encoded string
        pwd_hash: str = pwd_hash_bytes.decode('utf-8')
        # have passlib check if the entered password matches this hash
        return argon2.verify(given_password, pwd_hash)

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        exclude = ('password_hash',)
