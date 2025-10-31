import os
from flask import Blueprint

# determine the base directory of this blueprint for relative paths
bp_dir:        str = os.path.dirname(os.path.abspath(__file__))
templates_dir: str = os.path.join(bp_dir, 'templates')

bp = Blueprint('auth', __name__, template_folder=templates_dir)

from app.auth import routes
