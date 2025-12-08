from flask import request, jsonify, abort
from sqlalchemy.sql.expression import select, desc
from datetime import datetime, UTC
from flask_login import login_required, current_user, logout_user

from app import db
from app.api import bp
from app.auth.authmodels import UserSchema, User
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
    
    lat = data.get('latitude')
    lon = data.get('longitude')
    
    if lat is None or lon is None:
        return jsonify({'error': 'Latitude and longitude are required'}), 400
    
    properties = data.get('properties', {})
    name = properties.get('name') or properties.get('address_line1') or "Unnamed location"
    formal = properties.get('formatted') or properties.get('formal')
    address_line1 = properties.get('address_line1')
    address_line2 = properties.get('address_line2')
    
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

@bp.post('/save-video/')
@login_required
def save_video():
    """Save a video for the current user"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    video_url = data.get('video_url')
    if not video_url:
        return jsonify({'error': 'Video URL is required'}), 400
    
    existing = db.session.execute(
        db.select(SavedVideo).filter(
            SavedVideo.user_id == current_user.id,
            SavedVideo.video_url == video_url
        )
    ).first()
    
    if existing:
        return jsonify({'error': 'Video already saved'}), 409
    
    video = SavedVideo(
        video_url=video_url,
        title=data.get('title'),
        video_type=data.get('video_type'),
        user_id=current_user.id
    )
    
    db.session.add(video)
    db.session.commit()
    
    schema = SavedVideoSchema()
    return jsonify({
        'message': 'Video saved successfully',
        'video': schema.dump(video)
    }), 201

@bp.delete('/delete-video/<int:video_id>')
@login_required
def delete_video(video_id: int):
    """Delete a saved video for the current user"""
    video = db.session.get(SavedVideo, video_id)
    
    if not video:
        return jsonify({'error': 'Video not found'}), 404
    
    if video.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(video)
    db.session.commit()
    
    return jsonify({'message': 'Video deleted successfully'}), 200

@bp.delete('/delete-location/<int:location_id>')
@login_required
def delete_location(location_id: int):
    """Delete a saved location for the current user"""
    location = db.session.get(Location, location_id)
    
    if not location:
        return jsonify({'error': 'Location not found'}), 404
    
    if location.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(location)
    db.session.commit()
    
    return jsonify({'message': 'Location deleted successfully'}), 200

@bp.delete('/delete-account/')
@login_required
def delete_account():
    """Delete the current user's account and all associated data"""
    user_id = current_user.id
    
    db.session.execute(
        db.delete(SavedVideo).filter(SavedVideo.user_id == user_id)
    )
    
    db.session.execute(
        db.delete(Location).filter(Location.user_id == user_id)
    )
    
    user = db.session.get(User, user_id)
    if user:
        db.session.delete(user)
    
    db.session.commit()
    
    logout_user()
    
    return jsonify({'message': 'Account deleted successfully'}), 200
    
