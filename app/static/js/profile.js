document.addEventListener('DOMContentLoaded', () => {
    const deleteVideoButtons = document.querySelectorAll('.btn-delete-video');
    deleteVideoButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const videoId = button.dataset.videoId;
            if (!videoId) {
                console.error('Video ID not found');
                return;
            }
            try {
                const response = await fetch(`/api/delete-video/${videoId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    window.toast.success('Video deleted successfully!');
                    const videoCard = button.closest('.video-card');
                    if (videoCard) {
                        videoCard.remove();
                    }
                    const videosGrid = document.querySelector('.videos-grid');
                    if (videosGrid && videosGrid.children.length === 0) {
                        location.reload();
                    }
                }
                else {
                    const error = await response.json();
                    window.toast.error(error.error || 'Failed to delete video');
                }
            }
            catch (error) {
                console.error('Error deleting video:', error);
                window.toast.error('An error occurred while deleting the video');
            }
        });
    });
    const deleteLocationButtons = document.querySelectorAll('.btn-delete-location');
    deleteLocationButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const locationId = button.dataset.locationId;
            if (!locationId) {
                console.error('Location ID not found');
                return;
            }
            try {
                const response = await fetch(`/api/delete-location/${locationId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    window.toast.success('Location deleted successfully!');
                    const locationCard = button.closest('.location-card');
                    if (locationCard) {
                        locationCard.remove();
                    }
                    const locationsList = document.querySelector('.locations-list');
                    if (locationsList && locationsList.children.length === 0) {
                        location.reload();
                    }
                }
                else {
                    const error = await response.json();
                    window.toast.error(error.error || 'Failed to delete location');
                }
            }
            catch (error) {
                console.error('Error deleting location:', error);
                window.toast.error('An error occurred while deleting the location');
            }
        });
    });
});
