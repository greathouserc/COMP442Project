class ToastNotification {
    container;
    constructor() {
        this.container = null;
        this.init();
    }
    init() {
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
        else {
            this.container = document.querySelector('.toast-container');
        }
    }
    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
      <div class="toast-content">${message}</div>
      <div class="toast-progress"></div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;
        this.container.appendChild(toast);
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.remove(toast);
        });
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }
        return toast;
    }
    remove(toast) {
        toast.classList.add('hiding');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }
    error(message, duration = 3000) {
        return this.show(message, 'error', duration);
    }
    warning(message, duration = 3000) {
        return this.show(message, 'warning', duration);
    }
    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }
}
window.toast = new ToastNotification();
document.addEventListener('DOMContentLoaded', function () {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        const message = alert.textContent?.trim() || '';
        const category = alert.classList.contains('alert-success') ? 'success' :
            alert.classList.contains('alert-error') ? 'error' :
                alert.classList.contains('alert-warning') ? 'warning' : 'info';
        window.toast.show(message, category);
        alert.style.display = 'none';
    });
});
