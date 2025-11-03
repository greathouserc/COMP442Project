from flask import render_template, redirect, url_for
from flask_login import current_user

from app.core import bp

@bp.route('/')
def index():
    if current_user.is_authenticated:
        return render_template('home.html', user=current_user)
    return redirect(url_for('auth.get_login'))
