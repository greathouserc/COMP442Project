from flask import render_template, flash, redirect, url_for, request, current_app
from flask_login import current_user
from flask_mail import Message
from app import mail
from app.core import bp
from app.core.contactforms import ContactForm
import threading
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

@bp.route('/home/')
def index():
    form = ContactForm()
    return render_template('core/home.html', user=current_user, form=form)

@bp.route('/resources/')
def resources():
    return render_template('core/resources.html', user=current_user)

@bp.route('/resource_library/')
def resource_library():
    return render_template('core/resources.json')
@bp.route('/help/')
def get_help():
    return render_template('core/help.html', user=current_user)

def send_async_email(app, msg):
    """Send email in background thread"""
    with app.app_context():
        try:
            print("Starting email send...")
            print(f"MAIL_SERVER: {app.config.get('MAIL_SERVER')}")
            print(f"MAIL_PORT: {app.config.get('MAIL_PORT')}")
            print(f"MAIL_USERNAME: {app.config.get('MAIL_USERNAME')}")
            print(f"MAIL_USE_TLS: {app.config.get('MAIL_USE_TLS')}")
            print(f"MAIL_USE_SSL: {app.config.get('MAIL_USE_SSL')}")
            print(f"Sending to: {msg.recipients}")
            
            # Create an unverified SSL context
            context = ssl._create_unverified_context()
            
            if app.config.get('MAIL_USE_SSL'):
                # Use SSL (port 465)
                server = smtplib.SMTP_SSL(
                    app.config.get('MAIL_SERVER'),
                    app.config.get('MAIL_PORT'),
                    context=context,
                    timeout=15
                )
            else:
                # Use TLS (port 587)
                server = smtplib.SMTP(
                    app.config.get('MAIL_SERVER'),
                    app.config.get('MAIL_PORT'),
                    timeout=15
                )
                server.starttls(context=context)
            
            server.login(app.config.get('MAIL_USERNAME'), app.config.get('MAIL_PASSWORD'))
            
          
            
            email_msg = MIMEMultipart()
            email_msg['From'] = msg.sender
            email_msg['To'] = ', '.join(msg.recipients)
            email_msg['Subject'] = msg.subject
            if msg.reply_to:
                email_msg['Reply-To'] = msg.reply_to
            
            email_msg.attach(MIMEText(msg.body, 'plain'))
            
            server.send_message(email_msg)
            server.quit()
            
            print("Email sent successfully!")
        except Exception as e:
            print(f"✗ Error sending email: {type(e).__name__}")
            print(f"Error message: {str(e)}")

@bp.route('/contact', methods=['GET', 'POST'])
def contact():
    form = ContactForm()
    if form.validate_on_submit():
        name = form.name.data
        email = form.email.data
        subject = form.subject.data
        message = form.message.data
        
        msg = Message(
            subject=f"Contact Form: {subject}",
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            reply_to=email,
            recipients=['greathouser99@gmail.com'] 
        )
        msg.body = f"Name: {name}\nEmail: {email}\n\nMessage:\n{message}"
        
        print(f"Contact form submitted:\nFrom: {name} ({email})\nSubject: {subject}\nMessage: {message}")
        
        thread = threading.Thread(target=send_async_email, args=(current_app._get_current_object(), msg))
        thread.start()
        
        flash('Message sent!', 'success')
        return redirect(url_for('core.index') + '#contact')
    else:
        for field, errors in form.errors.items():
            for error in errors:
                flash(f'{getattr(form, field).label.text}: {error}', 'error')
    
    return redirect(url_for('core.index') + '#contact')
