from flask import current_app, render_template, redirect, url_for, flash, request
from flask import request
from sqlalchemy.sql.expression import select
from flask_login import login_user, logout_user, login_required, current_user

from app import db
from app.auth import bp
from app.auth.authmodels import User
from app.auth.authforms import LoginForm, RegisterForm

@bp.get('/register/')
def get_registration():
    form: RegisterForm = RegisterForm()
    return render_template('auth/register.html', form=form)

@bp.get('/login/')
def get_login():
    form: LoginForm = LoginForm()
    return render_template('auth/login.html', form=form)

@bp.post('/register/')
def post_registration():
    form: RegisterForm = RegisterForm()
    if form.validate():
        email = form.email.data
        password = form.password.data
        # adding check for email since id is now primary key
        existing_user = db.session.execute(select(User).filter(User.email == email)).first()
        if existing_user is not None:
            return render_template('auth/register.html', form=form, user_exists=True)
        else:
            new_user = User(email=email, password=password)

            db.session.add(new_user)
            db.session.commit()
            
            # Log in the newly created user
            login_user(new_user)
            
            # Redirect to home page
            if 'HOME_PAGE' in current_app.config:
                return redirect(str(current_app.config['HOME_PAGE']))
            else:
                return redirect(url_for('core.index'))
    else:
        for field, error_msg in form.errors.items():
            flash(f'{field}: {error_msg}')
        return redirect(url_for('auth.get_registration'))

        

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
            # only accept a 'next' target if it starts with '/' and matches a registered route
            candidate = request.args.get('next', '')
            if candidate and candidate.startswith('/'):
                try:
                    # try to match the candidate path against the app's URL map
                    adapter = current_app.url_map.bind('', url_scheme=request.scheme)
                    adapter.match(candidate)
                    next = candidate
                except Exception:
                    # fallback to configured HOME_PAGE or the core index
                    if 'HOME_PAGE' in current_app.config:
                        next = str(current_app.config['HOME_PAGE'])
                    else:
                        next = url_for('core.index')
            elif 'HOME_PAGE' in current_app.config:
                next = str(current_app.config['HOME_PAGE'])
            else:
                next = url_for('core.index')
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
    return redirect(url_for('core.index'))

@bp.post('/change-password/')
@login_required
def change_password():
    """Change the current user's password"""
    from flask import request, jsonify
    from app.auth.authforms import ChangePasswordForm
    
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    form: ChangePasswordForm = ChangePasswordForm(meta={'csrf': False}) if is_ajax else ChangePasswordForm()
    
    if form.validate():
        current_password = form.current_password.data
        new_password = form.new_password.data
        confirm_new_password = form.confirm_new_password.data
        
        if not current_user.verify_password(current_password):
            if is_ajax:
                return jsonify({'error': 'Current password is incorrect'}), 400
            flash('Current password is incorrect', 'error')
            return redirect(url_for('core.profile'))
        
        if new_password != confirm_new_password:
            if is_ajax:
                return jsonify({'error': 'New passwords do not match'}), 400
            flash('New passwords do not match', 'error')
            return redirect(url_for('core.profile'))
        
        current_user.password = new_password
        db.session.commit()
        
        if is_ajax:
            return jsonify({'message': 'Password changed successfully'}), 200
        flash('Password changed successfully', 'success')
        return redirect(url_for('core.profile'))
    else:
        error_messages = []
        for field, errors in form.errors.items():
            for error in errors:
                error_messages.append(f'{field}: {error}')
        
        if is_ajax:
            return jsonify({'error': '; '.join(error_messages)}), 400
        
        for msg in error_messages:
            flash(msg, 'error')
        return redirect(url_for('core.profile'))
