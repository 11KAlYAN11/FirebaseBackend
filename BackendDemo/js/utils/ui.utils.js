// UI Utility Functions
// Helper functions for UI interactions, notifications, and DOM manipulation

export const UIUtils = {
    /**
     * Show loading spinner
     */
    showLoading(elementId = 'loading-spinner') {
        const spinner = document.getElementById(elementId);
        if (spinner) {
            spinner.style.display = 'flex';
        }
    },

    /**
     * Hide loading spinner
     */
    hideLoading(elementId = 'loading-spinner') {
        const spinner = document.getElementById(elementId);
        if (spinner) {
            spinner.style.display = 'none';
        }
    },

    /**
     * Show notification message
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
      <span class="notification-icon">${this.getNotificationIcon(type)}</span>
      <span class="notification-message">${this.escapeHtml(message)}</span>
      <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    /**
     * Get icon for notification type
     */
    getNotificationIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    },

    /**
     * Show error message
     */
    showError(message, duration = 5000) {
        this.showNotification(message, 'error', duration);
    },

    /**
     * Show success message
     */
    showSuccess(message, duration = 3000) {
        this.showNotification(message, 'success', duration);
    },

    /**
     * Show warning message
     */
    showWarning(message, duration = 4000) {
        this.showNotification(message, 'warning', duration);
    },

    /**
     * Show info message
     */
    showInfo(message, duration = 3000) {
        this.showNotification(message, 'info', duration);
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Format date to readable string
     */
    formatDate(timestamp) {
        if (!timestamp) return '';

        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    },

    /**
     * Format timestamp to time string
     */
    formatTime(timestamp) {
        if (!timestamp) return '';

        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Format full date and time
     */
    formatDateTime(timestamp) {
        if (!timestamp) return '';

        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Disable button with loading state
     */
    setButtonLoading(button, isLoading, loadingText = 'Loading...') {
        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.innerHTML = `<span class="spinner-small"></span> ${loadingText}`;
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || button.textContent;
        }
    },

    /**
     * Toggle element visibility
     */
    toggleVisibility(elementId, show) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    },

    /**
     * Clear form inputs
     */
    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    },

    /**
     * Set form values
     */
    setFormValues(formId, values) {
        const form = document.getElementById(formId);
        if (!form) return;

        Object.keys(values).forEach(key => {
            const input = form.elements[key];
            if (input) {
                input.value = values[key] || '';
            }
        });
    },

    /**
     * Get form values as object
     */
    getFormValues(formId) {
        const form = document.getElementById(formId);
        if (!form) return {};

        const formData = new FormData(form);
        const values = {};

        for (let [key, value] of formData.entries()) {
            values[key] = value;
        }

        return values;
    },

    /**
     * Confirm action with user
     */
    confirm(message, onConfirm, onCancel) {
        if (window.confirm(message)) {
            onConfirm && onConfirm();
        } else {
            onCancel && onCancel();
        }
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Get priority badge HTML
     */
    getPriorityBadge(priority) {
        const badges = {
            low: '<span class="badge badge-low">Low</span>',
            medium: '<span class="badge badge-medium">Medium</span>',
            high: '<span class="badge badge-high">High</span>'
        };
        return badges[priority] || '';
    },

    /**
     * Get status badge HTML
     */
    getStatusBadge(status) {
        const badges = {
            pending: '<span class="badge badge-pending">Pending</span>',
            completed: '<span class="badge badge-completed">Completed</span>'
        };
        return badges[status] || '';
    }
};
