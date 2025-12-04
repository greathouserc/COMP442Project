document.addEventListener('DOMContentLoaded', () => {
    const flashMessages = document.getElementById('flash-messages');
    if (flashMessages) {
        const messages = flashMessages.querySelectorAll('[data-category]');
        messages.forEach((msg) => {
            const category = msg.getAttribute('data-category') || 'info';
            const text = msg.textContent || '';
            if (category === 'success') {
                window.toast.success(text);
            }
            else if (category === 'error') {
                window.toast.error(text);
            }
            else if (category === 'warning') {
                window.toast.warning(text);
            }
            else {
                window.toast.info(text);
            }
        });
    }
    const changePasswordBtn = document.getElementById('change-password-btn');
    const changePasswordModal = document.getElementById('change-password-modal');
    const cancelChangePasswordBtn = document.getElementById('cancel-change-password-btn');
    const changePasswordForm = document.getElementById('change-password-form');
    const newPasswordInput = document.getElementById('new-password-input');
    const confirmNewPasswordInput = document.getElementById('confirm-new-password-input');
    if (changePasswordBtn && changePasswordModal) {
        changePasswordBtn.addEventListener('click', () => {
            changePasswordModal.classList.add('show');
            if (changePasswordForm) {
                changePasswordForm.reset();
            }
        });
        const closeChangePasswordModal = () => {
            changePasswordModal.classList.remove('show');
            if (changePasswordForm) {
                changePasswordForm.reset();
            }
        };
        if (cancelChangePasswordBtn) {
            cancelChangePasswordBtn.addEventListener('click', closeChangePasswordModal);
        }
        const closeModalBtns = changePasswordModal.querySelectorAll('.close-modal');
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', closeChangePasswordModal);
        });
        changePasswordModal.addEventListener('click', (e) => {
            if (e.target === changePasswordModal) {
                closeChangePasswordModal();
            }
        });
        if (confirmNewPasswordInput) {
            confirmNewPasswordInput.addEventListener('input', () => {
                if (newPasswordInput.value !== confirmNewPasswordInput.value) {
                    confirmNewPasswordInput.setCustomValidity('Passwords do not match');
                }
                else {
                    confirmNewPasswordInput.setCustomValidity('');
                }
            });
        }
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', () => {
                if (confirmNewPasswordInput.value && newPasswordInput.value !== confirmNewPasswordInput.value) {
                    confirmNewPasswordInput.setCustomValidity('Passwords do not match');
                }
                else {
                    confirmNewPasswordInput.setCustomValidity('');
                }
            });
        }
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const currentPasswordInput = document.getElementById('current-password-input');
                const newPwdInput = document.getElementById('pwd-input');
                const confirmPwdInput = document.getElementById('pwd-confirm');
                const submitBtn = document.getElementById('confirm-change-password-btn');
                if (!currentPasswordInput || !newPwdInput || !confirmPwdInput || !submitBtn) {
                    return;
                }
                submitBtn.disabled = true;
                submitBtn.textContent = 'Changing...';
                const formData = new FormData(changePasswordForm);
                try {
                    const response = await fetch('/auth/change-password/', {
                        method: 'POST',
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: formData
                    });
                    const data = await response.json();
                    if (response.ok) {
                        window.toast.success(data.message || 'Password changed successfully!');
                        closeChangePasswordModal();
                    }
                    else {
                        window.toast.error(data.error || 'Failed to change password');
                    }
                }
                catch (error) {
                    console.error('Error changing password:', error);
                    window.toast.error('An error occurred while changing the password');
                }
                finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Change Password';
                }
            });
        }
    }
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const modal = document.getElementById('delete-account-modal');
    const closeModal = modal?.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancel-delete-btn');
    const confirmBtn = document.getElementById('confirm-delete-btn');
    const confirmInput = document.getElementById('delete-confirmation-input');
    if (deleteAccountBtn && modal) {
        deleteAccountBtn.addEventListener('click', () => {
            modal.classList.add('show');
            if (confirmInput) {
                confirmInput.value = '';
                confirmInput.focus();
            }
            if (confirmBtn) {
                confirmBtn.disabled = true;
            }
        });
        const closeModalHandler = () => {
            modal.classList.remove('show');
            if (confirmInput) {
                confirmInput.value = '';
            }
        };
        if (closeModal) {
            closeModal.addEventListener('click', closeModalHandler);
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModalHandler);
        }
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModalHandler();
            }
        });
        if (confirmInput && confirmBtn) {
            confirmInput.addEventListener('input', () => {
                confirmBtn.disabled = confirmInput.value !== 'delete';
            });
        }
        if (confirmBtn) {
            confirmBtn.addEventListener('click', async () => {
                if (confirmInput?.value !== 'delete') {
                    return;
                }
                confirmBtn.disabled = true;
                confirmBtn.textContent = 'Deleting...';
                try {
                    const response = await fetch('/api/delete-account/', {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        modal.classList.remove('show');
                        window.toast.success('Account deleted successfully!');
                        setTimeout(() => {
                            window.location.href = '/home';
                        }, 2000);
                    }
                    else {
                        const error = await response.json();
                        window.toast.error(error.error || 'Failed to delete account');
                        confirmBtn.disabled = false;
                        confirmBtn.textContent = 'Delete My Account';
                    }
                }
                catch (error) {
                    console.error('Error deleting account:', error);
                    window.toast.error('An error occurred while deleting the account');
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = 'Delete My Account';
                }
            });
        }
    }
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
