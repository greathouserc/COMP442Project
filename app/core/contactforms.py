from flask_wtf import FlaskForm
from wtforms import EmailField, SubmitField, StringField
from wtforms.validators import InputRequired, Email, Length


class ContactForm(FlaskForm):
    name: StringField = StringField('Name', validators=[InputRequired(), Length(max=100)])
    email: EmailField = EmailField('Email', validators=[InputRequired(), Email()])
    subject: StringField = StringField('Subject', validators=[InputRequired(), Length(max=150)])
    message: StringField = StringField('Message', validators=[InputRequired(), Length(max=2000)])
    submit: SubmitField = SubmitField("Send Message")

