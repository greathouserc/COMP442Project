from flask import request, jsonify, abort
from sqlalchemy.sql.expression import select, desc
from datetime import datetime, UTC
from flask_login import login_required, current_user

from app import db
from app.api import bp
from app.auth.authmodels import UserSchema
from app.core.coremodels import Location, LocationSchema, SavedVideo, SavedVideoSchema

################################################################################
# REST API
################################################################################

@bp.get('/user-info/')
@login_required
def get_user_info():
    """Get a JSON object with the current user's id and email address"""
    schema = UserSchema()
    return jsonify(schema.dump(current_user))

@bp.post('/save-location/')
@login_required
def save_location():
    """Save a location for the current user"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Extract coordinates
    lat = data.get('latitude')
    lon = data.get('longitude')
    
    if lat is None or lon is None:
        return jsonify({'error': 'Latitude and longitude are required'}), 400
    
    # Extract properties
    properties = data.get('properties', {})
    name = properties.get('name') or properties.get('address_line1') or "Unnamed location"
    formal = properties.get('formatted') or properties.get('formal')
    address_line1 = properties.get('address_line1')
    address_line2 = properties.get('address_line2')
    
    # Create new location
    loc = Location(
        name=name,
        formal=formal,
        address_line1=address_line1,
        address_line2=address_line2,
        latitude=lat,
        longitude=lon,
        user_id=current_user.id
    )
    
    db.session.add(loc)
    db.session.commit()
    
    schema = LocationSchema()
    return jsonify({
        'message': 'Location saved successfully',
        'location': schema.dump(loc)
    }), 201

@bp.get('/get-locations/<int:user_id>/')
def get_locations(user_id: int):
    """Get a JSON object with the current user's saved locations"""
    query = db.select(Location).filter(Location.user_id == user_id)
    rows = db.session.execute(query).all()
    locations: list[Location] = [row[0] for row in rows]

    schema = LocationSchema()
    #return jsonify(schema.dump(locations))

    return jsonify({
        'fetched': datetime.now(UTC).isoformat(),
        'count': len(locations),
        'results': schema.dump(locations, many = True)
    })

@bp.get('/get-saved-videos/<int:user_id>/')
def get_saved_videos(user_id: int):
    """Get a JSON object with the current user's saved videos"""
    query = db.select(SavedVideo).filter(SavedVideo.user_id == user_id)
    rows = db.session.execute(query).all()
    videos: list[SavedVideo] = [row[0] for row in rows]

    schema = SavedVideoSchema()

    return jsonify({
        'fetched': datetime.now(UTC).isoformat(),
        'count': len(videos),
        'results': schema.dump(videos, many = True)
    })
    
