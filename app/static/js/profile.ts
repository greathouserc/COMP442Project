function createModalCloser(modal: HTMLElement, form?: HTMLFormElement, input?: HTMLInputElement): () => void {
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

function setupModalCloseHandlers(
    modal: HTMLElement,
    closeHandler: () => void,
    closeButtons: (HTMLElement | null)[],
    allowClickOutside: boolean = true
): void {
    closeButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', closeHandler);
        }
    });
    
    if (allowClickOutside) {
        modal.addEventListener('click', (e: MouseEvent) => {
            if (e.target === modal) {
                closeHandler();
            }
        });
    }
}

function setupPasswordValidation(
    passwordInput: HTMLInputElement,
    confirmPasswordInput: HTMLInputElement
): void {
    const validatePasswords = () => {
        if (passwordInput.value && confirmPasswordInput.value && 
            passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.setCustomValidity('Passwords do not match');
        } else {
            confirmPasswordInput.setCustomValidity('');
        }
    };
    
    passwordInput.addEventListener('input', validatePasswords);
    confirmPasswordInput.addEventListener('input', validatePasswords);
}

async function deleteItem(
    itemId: string,
    apiEndpoint: string,
    itemName: string,
    cardSelector: string,
    parentSelector: string,
    button: HTMLButtonElement
): Promise<void> {
    try {
        const response = await fetch(`${apiEndpoint}/${itemId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            (window as any).toast.success(`${itemName} deleted successfully!`);
            const card = button.closest(cardSelector);
            if (card) {
                card.remove();
            }
            
            const parent = document.querySelector(parentSelector);
            if (parent && parent.children.length === 0) {
                location.reload();
            }
        } else {
            const error = await response.json();
            (window as any).toast.error(error.error || `Failed to delete ${itemName.toLowerCase()}`);
        }
    } catch (error) {
        console.error(`Error deleting ${itemName.toLowerCase()}:`, error);
        (window as any).toast.error(`An error occurred while deleting the ${itemName.toLowerCase()}`);
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

        const closeChangePasswordModal = createModalCloser(changePasswordModal, changePasswordForm);
        const closeModalBtns = changePasswordModal.querySelectorAll('.close-modal');
        setupModalCloseHandlers(
            changePasswordModal,
            closeChangePasswordModal,
            [cancelChangePasswordBtn, ...Array.from(closeModalBtns) as HTMLElement[]],
            false
        );

        if (newPasswordInput && confirmNewPasswordInput) {
            setupPasswordValidation(newPasswordInput, confirmNewPasswordInput);
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
        
        const closeModalHandler = createModalCloser(modal, undefined, confirmInput);
        setupModalCloseHandlers(modal, closeModalHandler, [closeModal as HTMLElement, cancelBtn]);
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
        button.addEventListener('click', async () => {
            const videoId = button.dataset.videoId;
            if (!videoId) {
                console.error('Video ID not found');
                return;
            }
            await deleteItem(videoId, '/api/delete-video', 'Video', '.video-card', '.videos-grid', button);
        });
    });

    const deleteLocationButtons = document.querySelectorAll('.btn-delete-location') as NodeListOf<HTMLButtonElement>;
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
