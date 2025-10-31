from flask_wtf import FlaskForm
from wtforms import EmailField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Email, Length

MIN_PASSWORD_LENGTH: int = 8

class LoginForm(FlaskForm):
    email: EmailField = EmailField('Email',
        validators=[InputRequired(), Email()])
    password: PasswordField = PasswordField('Password',
        validators=[InputRequired(), Length(min=MIN_PASSWORD_LENGTH)])
    submit: SubmitField = SubmitField("Login")
