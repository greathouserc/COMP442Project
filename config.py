import os
import base64
from dotenv import load_dotenv

# record the absolute path of the directory in which this file is located
appdir: str = os.path.dirname(os.path.abspath(__file__))
# load any config options from the environment variable file
load_dotenv(os.path.join(appdir, '.appenv'))
# compute any needed default values that rely on this base directory
default_db_path = os.path.join(appdir, 'user_table.db')

# define a config singleton to be used in configuring apps
class Config:
    # for each config option either find it in an environment variable or throw an exception
    if 'SECRET_KEY' not in os.environ: raise OSError("Missing app configuration for SECRET_KEY!")
    SECRET_KEY = os.environ['SECRET_KEY']
    PEPPER = base64.b16decode(os.environ['PEPPER'])
    if 'DATABASE_PATH' in os.environ:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.abspath(os.environ['DATABASE_PATH'])}"
    else:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{default_db_path}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Flask-Mail 
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'True') == 'True'
    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'False') == 'True'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')
    MAIL_MAX_EMAILS = None
    MAIL_ASCII_ATTACHMENTS = False
    MAIL_SUPPRESS_SEND = False
    # SSL/TLS configuration for macOS certificate issues cuz macOS is fun like that
    MAIL_SSL_CONTEXT_CERTFILE = None
    MAIL_SSL_CONTEXT_KEYFILE = None
