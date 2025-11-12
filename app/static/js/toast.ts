// Toast notification system
type ToastType = 'info' | 'success' | 'error' | 'warning';

class ToastNotification {
  private container: HTMLElement | null;

  constructor() {
    this.container = null;
    this.init();
  }

  private init(): void {
    if (!document.querySelector('.toast-container')) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.querySelector('.toast-container');
    }
  }

  show(message: string, type: ToastType = 'info', duration: number = 3000): HTMLElement {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
      <div class="toast-content">${message}</div>
      <div class="toast-progress"></div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    this.container!.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close') as HTMLElement;
    closeBtn.addEventListener('click', () => {
      this.remove(toast);
    });

    // Remove after duration milliseconds
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast);
      }, duration);
    }

    return toast;
  }

  remove(toast: HTMLElement): void {
    toast.classList.add('hiding');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  success(message: string, duration: number = 3000): HTMLElement {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 3000): HTMLElement {
    return this.show(message, 'error', duration);
  }

  warning(message: string, duration: number = 3000): HTMLElement {
    return this.show(message, 'warning', duration);
  }

  info(message: string, duration: number = 3000): HTMLElement {
    return this.show(message, 'info', duration);
  }
}

// Extend the Window interface to include toast
interface Window {
  toast: ToastNotification;
}

(window as any).toast = new ToastNotification();

document.addEventListener('DOMContentLoaded', function() {
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    const message = alert.textContent?.trim() || '';
    const category: ToastType = alert.classList.contains('alert-success') ? 'success' :
                    alert.classList.contains('alert-error') ? 'error' :
                    alert.classList.contains('alert-warning') ? 'warning' : 'info';
    
    (window as any).toast.show(message, category);
    
    (alert as HTMLElement).style.display = 'none';
  });
});
