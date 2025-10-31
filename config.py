import os
import base64
from dotenv import load_dotenv

# record the absolute path of the directory in which this file is located
appdir: str = os.path.dirname(os.path.abspath(__file__))
# load any config options from the environment variable file
load_dotenv(os.path.join(appdir, '.appenv'))
# compute any needed default values that rely on this base directory
default_db_path = os.path.join(appdir, 'example.db')

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
