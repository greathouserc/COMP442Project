document.addEventListener("DOMContentLoaded", async () => {
    loadResources();
});
async function loadResources() {
    const indexResponse = await fetch("/resource_library");
    const index = await validateJSON(indexResponse);
    let savedVideoUrls = new Set();
    let isUserLoggedIn = false;
    try {
        const userInfoResponse = await fetch('/api/user-info/');
        if (userInfoResponse.ok) {
            isUserLoggedIn = true;
            const userInfo = await userInfoResponse.json();
            const savedVideosResponse = await fetch(`/api/get-saved-videos/${userInfo.id}`);
            if (savedVideosResponse.ok) {
                const savedVideos = await savedVideosResponse.json();
                savedVideoUrls = new Set(savedVideos.results.map((v) => v.video_url));
            }
        }
    }
    catch (error) {
        console.log('User not logged in or error fetching saved videos');
    }
    const advice = document.getElementById("general-advice");
    const health = document.getElementById("medical-health");
    const spiritual = document.getElementById("spiritual-health");
    for (const stub of index.results) {
        console.log(stub);
        const baseURL = "https://www.youtube.com/embed/";
        const indexURL = `${baseURL}${stub.url}`;
        const container = document.createElement('div');
        container.className = 'video-container';
        const iframe = document.createElement('iframe');
        iframe.width = "280";
        iframe.height = "158";
        iframe.src = indexURL;
        iframe.title = "YouTube video player";
        container.appendChild(iframe);
        if (isUserLoggedIn) {
            const isSaved = savedVideoUrls.has(stub.url);
            const saveBtn = document.createElement('button');
            saveBtn.className = isSaved ? 'save-video-btn saved' : 'save-video-btn';
            saveBtn.innerHTML = isSaved ? 'Unsave' : 'Save';
            saveBtn.setAttribute('data-video-url', stub.url);
            saveBtn.setAttribute('data-video-type', stub.type);
            saveBtn.setAttribute('data-saved', isSaved.toString());
            saveBtn.onclick = () => toggleSaveVideo(saveBtn, stub.url, stub.type);
            container.appendChild(saveBtn);
        }
        if (stub.type === "G") {
            advice.appendChild(container);
        }
        else if (stub.type === "M") {
            health.appendChild(container);
        }
        else {
            spiritual.appendChild(container);
        }
    }
}
async function toggleSaveVideo(button, videoUrl, videoType) {
    const isSaved = button.getAttribute('data-saved') === 'true';
    if (isSaved) {
        await unsaveVideo(button, videoUrl);
    }
    else {
        await saveVideo(button, videoUrl, videoType);
    }
}
async function saveVideo(button, videoUrl, videoType) {
    try {
        const response = await fetch('/api/save-video/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                video_url: videoUrl,
                video_type: videoType,
                title: getVideoTitle(videoType)
            })
        });
        const data = await response.json();
        if (response.ok) {
            window.toast.success('Video saved successfully!');
            button.innerHTML = 'Unsave';
            button.classList.add('saved');
            button.setAttribute('data-saved', 'true');
        }
        else if (response.status === 409) {
            window.toast.info('Video already saved');
            button.innerHTML = 'Unsave';
            button.classList.add('saved');
            button.setAttribute('data-saved', 'true');
        }
        else if (response.status === 401) {
            window.toast.error('Please log in to save videos');
        }
        else {
            window.toast.error(data.error || 'Failed to save video');
        }
    }
    catch (error) {
        console.error('Error saving video:', error);
        window.toast.error('An error occurred while saving');
    }
}
async function unsaveVideo(button, videoUrl) {
    try {
        const userInfoResponse = await fetch('/api/user-info/');
        if (!userInfoResponse.ok) {
            window.toast.error('Please log in to unsave videos');
            return;
        }
        const userInfo = await userInfoResponse.json();
        const savedVideosResponse = await fetch(`/api/get-saved-videos/${userInfo.id}`);
        if (!savedVideosResponse.ok) {
            window.toast.error('Failed to fetch saved videos');
            return;
        }
        const savedVideos = await savedVideosResponse.json();
        const videoToDelete = savedVideos.results.find((v) => v.video_url === videoUrl);
        if (!videoToDelete) {
            window.toast.error('Video not found in saved list');
            return;
        }
        const response = await fetch(`/api/delete-video/${videoToDelete.id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            window.toast.success('Video unsaved successfully!');
            button.innerHTML = 'Save';
            button.classList.remove('saved');
            button.setAttribute('data-saved', 'false');
        }
        else {
            const data = await response.json();
            window.toast.error(data.error || 'Failed to unsave video');
        }
    }
    catch (error) {
        console.error('Error unsaving video:', error);
        window.toast.error('An error occurred while unsaving');
    }
}
function getVideoTitle(type) {
    switch (type) {
        case 'G': return 'General Advice';
        case 'M': return 'Medical Advice';
        case 'S': return 'Spiritual Wellbeing';
        default: return 'Resource Video';
    }
}
async function validateJSON(response) {
    if (response.ok) {
        return response.json();
    }
    else {
        return Promise.reject(response);
    }
}
