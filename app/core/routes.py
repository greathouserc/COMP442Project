from flask import render_template
from flask_login import current_user

from app.core import bp

@bp.route('/')
def index():
    return render_template('home.html', user=current_user)
