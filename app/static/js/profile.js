function createModalCloser(modal, form, input) {
    return () => {
        modal.classList.remove('show');
        if (form) {
            form.reset();
        }
        if (input) {
            input.value = '';
        }
    };
}
function setupModalCloseHandlers(modal, closeHandler, closeButtons, allowClickOutside = true) {
    closeButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', closeHandler);
        }
    });
    if (allowClickOutside) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeHandler();
            }
        });
    }
}
function setupPasswordValidation(passwordInput, confirmPasswordInput) {
    const validatePasswords = () => {
        if (passwordInput.value && confirmPasswordInput.value &&
            passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.setCustomValidity('Passwords do not match');
        }
        else {
            confirmPasswordInput.setCustomValidity('');
        }
    };
    passwordInput.addEventListener('input', validatePasswords);
    confirmPasswordInput.addEventListener('input', validatePasswords);
}
async function deleteItem(itemId, apiEndpoint, itemName, cardSelector, parentSelector, button) {
    try {
        const response = await fetch(`${apiEndpoint}/${itemId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            window.toast.success(`${itemName} deleted successfully!`);
            const card = button.closest(cardSelector);
            if (card) {
                card.remove();
            }
            const parent = document.querySelector(parentSelector);
            if (parent && parent.children.length === 0) {
                location.reload();
            }
        }
        else {
            const error = await response.json();
            window.toast.error(error.error || `Failed to delete ${itemName.toLowerCase()}`);
        }
    }
    catch (error) {
        console.error(`Error deleting ${itemName.toLowerCase()}:`, error);
        window.toast.error(`An error occurred while deleting the ${itemName.toLowerCase()}`);
    }
}
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
        const closeChangePasswordModal = createModalCloser(changePasswordModal, changePasswordForm);
        const closeModalBtns = changePasswordModal.querySelectorAll('.close-modal');
        setupModalCloseHandlers(changePasswordModal, closeChangePasswordModal, [cancelChangePasswordBtn, ...Array.from(closeModalBtns)], false);
        if (newPasswordInput && confirmNewPasswordInput) {
            setupPasswordValidation(newPasswordInput, confirmNewPasswordInput);
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
        const closeModalHandler = createModalCloser(modal, undefined, confirmInput);
        setupModalCloseHandlers(modal, closeModalHandler, [closeModal, cancelBtn]);
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
        button.addEventListener('click', async () => {
            const videoId = button.dataset.videoId;
            if (!videoId) {
                console.error('Video ID not found');
                return;
            }
            await deleteItem(videoId, '/api/delete-video', 'Video', '.video-card', '.videos-grid', button);
        });
    });
    const deleteLocationButtons = document.querySelectorAll('.btn-delete-location');
    deleteLocationButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const locationId = button.dataset.locationId;
            if (!locationId) {
                console.error('Location ID not found');
                return;
            }
            await deleteItem(locationId, '/api/delete-location', 'Location', '.location-card', '.locations-list', button);
        });
    });
});
