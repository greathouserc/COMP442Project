document.addEventListener('DOMContentLoaded', () => {
    const flashMessages = document.getElementById('flash-messages');
    if (flashMessages) {
        const messages = flashMessages.querySelectorAll('[data-category]');
        messages.forEach((msg) => {
            const category = msg.getAttribute('data-category') || 'info';
            const text = msg.textContent || '';
            
            if (category === 'success') {
                (window as any).toast.success(text);
            } else if (category === 'error') {
                (window as any).toast.error(text);
            } else if (category === 'warning') {
                (window as any).toast.warning(text);
            } else {
                (window as any).toast.info(text);
            }
        });
    }

    const changePasswordBtn = <HTMLButtonElement> document.getElementById('change-password-btn');
    const changePasswordModal = document.getElementById('change-password-modal');
    const cancelChangePasswordBtn = <HTMLButtonElement> document.getElementById('cancel-change-password-btn');
    const changePasswordForm = <HTMLFormElement> document.getElementById('change-password-form');
    const newPasswordInput = <HTMLInputElement> document.getElementById('new-password-input');
    const confirmNewPasswordInput = <HTMLInputElement> document.getElementById('confirm-new-password-input');

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

        changePasswordModal.addEventListener('click', (e: MouseEvent) => {
            if (e.target === changePasswordModal) {
                closeChangePasswordModal();
            }
        });

        if (confirmNewPasswordInput) {
            confirmNewPasswordInput.addEventListener('input', () => {
                if (newPasswordInput.value !== confirmNewPasswordInput.value) {
                    confirmNewPasswordInput.setCustomValidity('Passwords do not match');
                } else {
                    confirmNewPasswordInput.setCustomValidity('');
                }
            });
        }

        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', () => {
                if (confirmNewPasswordInput.value && newPasswordInput.value !== confirmNewPasswordInput.value) {
                    confirmNewPasswordInput.setCustomValidity('Passwords do not match');
                } else {
                    confirmNewPasswordInput.setCustomValidity('');
                }
            });
        }

        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', async (e: Event) => {
                e.preventDefault();

                const currentPasswordInput = <HTMLInputElement> document.getElementById('current-password-input');
                const newPwdInput = <HTMLInputElement> document.getElementById('pwd-input');
                const confirmPwdInput = <HTMLInputElement> document.getElementById('pwd-confirm');
                const submitBtn = <HTMLButtonElement> document.getElementById('confirm-change-password-btn');

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
                        (window as any).toast.success(data.message || 'Password changed successfully!');
                        closeChangePasswordModal();
                    } else {
                        (window as any).toast.error(data.error || 'Failed to change password');
                    }
                } catch (error) {
                    console.error('Error changing password:', error);
                    (window as any).toast.error('An error occurred while changing the password');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Change Password';
                }
            });
        }
    }

    const deleteAccountBtn = <HTMLButtonElement> document.getElementById('delete-account-btn');
    const modal = document.getElementById('delete-account-modal');
    const closeModal = modal?.querySelector('.close-modal');
    const cancelBtn = <HTMLButtonElement> document.getElementById('cancel-delete-btn');
    const confirmBtn = <HTMLButtonElement> document.getElementById('confirm-delete-btn');
    const confirmInput = <HTMLInputElement> document.getElementById('delete-confirmation-input');
    
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
                        (window as any).toast.success('Account deleted successfully!');
                        setTimeout(() => {
                            window.location.href = '/home';
                        }, 2000);
                    } else {
                        const error = await response.json();
                        (window as any).toast.error(error.error || 'Failed to delete account');
                        confirmBtn.disabled = false;
                        confirmBtn.textContent = 'Delete My Account';
                    }
                } catch (error) {
                    console.error('Error deleting account:', error);
                    (window as any).toast.error('An error occurred while deleting the account');
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = 'Delete My Account';
                }
            });
        }
    }
    
    const deleteVideoButtons = document.querySelectorAll('.btn-delete-video') as NodeListOf<HTMLButtonElement>;
    
    deleteVideoButtons.forEach(button => {
        button.addEventListener('click', async (e: MouseEvent) => {
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
                    (window as any).toast.success('Video deleted successfully!');
                    const videoCard = button.closest('.video-card');
                    if (videoCard) {
                        videoCard.remove();
                    }
                    
                    const videosGrid = document.querySelector('.videos-grid');
                    if (videosGrid && videosGrid.children.length === 0) {
                        location.reload();
                    }
                } else {
                    const error = await response.json();
                    (window as any).toast.error(error.error || 'Failed to delete video');
                }
            } catch (error) {
                console.error('Error deleting video:', error);
                (window as any).toast.error('An error occurred while deleting the video');
            }
        });
    });

    const deleteLocationButtons = document.querySelectorAll('.btn-delete-location') as NodeListOf<HTMLButtonElement>;
    
    deleteLocationButtons.forEach(button => {
        button.addEventListener('click', async (e: MouseEvent) => {
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
                    (window as any).toast.success('Location deleted successfully!');
                    const locationCard = button.closest('.location-card');
                    if (locationCard) {
                        locationCard.remove();
                    }
                    
                    const locationsList = document.querySelector('.locations-list');
                    if (locationsList && locationsList.children.length === 0) {
                        location.reload();
                    }
                } else {
                    const error = await response.json();
                    (window as any).toast.error(error.error || 'Failed to delete location');
                }
            } catch (error) {
                console.error('Error deleting location:', error);
                (window as any).toast.error('An error occurred while deleting the location');
            }
        });
    });
});
