from flask import current_app, render_template, redirect, url_for, flash, request
from flask import request
from sqlalchemy.sql.expression import select
from flask_login import login_user, logout_user, login_required, current_user

from app import db
from app.auth import bp
from app.auth.models import User
from app.auth.forms import LoginForm, RegisterForm

@bp.get('/register/')
def get_registration():
    form: RegisterForm = RegisterForm()
    return render_template('register.html', form=form)

@bp.post('/register/')
def post_registration():
    form: RegisterForm = RegisterForm()
    if form.validate():
        email = form.email.data
        password = form.password.data
        new_user = User(email=email, password=password)
        db.session.add(new_user)
        db.session.commit()
        

@bp.get('/login/')
def get_login():
    form: LoginForm = LoginForm()
    return render_template('login.html', form=form)

@bp.post('/login/')
def post_login():
    form: LoginForm = LoginForm()
    # until successful, the user will be forwarded back to get the login form
    next: str = url_for('auth.get_login')
    if form.validate():
        # get the email address and password out of the login form
        email: str = str(form.email.data)
        password: str = str(form.password.data)
        # look up the user with this email address (if any)
        query = select(User).filter(User.email == str(email))
        user_row = db.session.execute(query).first()
        user: User|None = user_row[0] if user_row is not None else None
        # if there is such a user and the password is correct, log them in
        if user is not None and user.verify_password(password):
            login_user(user)
            # update the next url where the user should be redirected
            if 'next' in request.args and request.args['next'].startswith('/'):
                next = str(request.args['next'])
            elif 'HOME_PAGE' in current_app.config:
                next = str(current_app.config['HOME_PAGE'])
            else:
                next = '/'
            return redirect(next)
        # if the email or password is incorrect, flash a message and redirect to get the form again
        else:
            flash("Invalid Credentials")
            return redirect(url_for('auth.get_login'))
    else:
        # on invalid form, flash all error messages
        for field,error_msg in form.errors.items():
            flash(f"{field}: {error_msg}")
        return redirect(url_for('auth.get_login'))

@bp.route('/logout/')
@login_required
def route_logout():
    logout_user()
    return redirect(url_for('auth.get_login'))
