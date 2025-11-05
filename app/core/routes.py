from flask import render_template, flash, redirect, url_for, request
from flask_login import current_user
from app.core import bp
from app.core.contactforms import ContactForm

@bp.route('/home/')
def index():
    form = ContactForm()
    return render_template('home.html', user=current_user, form=form)

@bp.route('/resources/')
def resources():
    return render_template('resources.html', user=current_user)

@bp.route('/contact', methods=['GET', 'POST'])
def contact():
    form = ContactForm()
    if form.validate_on_submit():
        try:
            # TODO: add mail functionality
            flash('Your message has been sent successfully!', 'success')
            return redirect(url_for('core.index') + '#contact')
        except Exception as e:
            flash('An error occurred while sending your message. Please try again later.', 'error')
    else:
        for field, errors in form.errors.items():
            for error in errors:
                flash(f'{getattr(form, field).label.text}: {error}', 'error')
    
    return redirect(url_for('core.index') + '#contact')
