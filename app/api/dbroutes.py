from flask import request, jsonify, abort
from sqlalchemy.sql.expression import select, desc
from datetime import datetime, UTC
from flask_login import login_required, current_user

from app import db
from app.api import bp
from app.auth.authmodels import UserSchema
from app.core.coremodels import Location, LocationSchema

################################################################################
# REST API
################################################################################

@bp.get('/user-info/')
@login_required
def get_user_info():
    """Get a JSON object with the current user's id and email address"""
    schema = UserSchema()
    return jsonify(schema.dump(current_user))

# @bp.post('/save-location/')
# def saveLocation(lat: float, lon: float, name: str | None, formal: str | None, add1: str | None, add2: str | None):
#     loc = Location(name = name, formal = formal, add1 = add1, add2 = add2, latitude = lat, longitude = lon)
#     db.session.add(loc)

@bp.get('/get-locations/<string:userEmail>/')
def get_locations(userEmail: str):
    """Get a JSON object with the current user's saved locations"""
    query = db.select(Location).filter(Location.user == userEmail)
    rows = db.session.execute(query).all()
    locations: list[Location] = [row[0] for row in rows]

    schema = LocationSchema()
    #return jsonify(schema.dump(locations))

    return jsonify({
        'fetched': datetime.now(UTC).isoformat(),
        'count': len(locations),
        'results': schema.dump(locations, many = True)
    })
    
