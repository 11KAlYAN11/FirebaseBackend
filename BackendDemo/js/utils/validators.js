// Input Validation Utilities
// Functions for validating user input

export const Validators = {
    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate password strength
     * At least 6 characters
     */
    isValidPassword(password) {
        return password && password.length >= 6;
    },

    /**
     * Validate password strength (strong)
     * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
     */
    isStrongPassword(password) {
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return strongRegex.test(password);
    },

    /**
     * Validate required field
     */
    isRequired(value) {
        return value !== null && value !== undefined && value.trim() !== '';
    },

    /**
     * Validate string length
     */
    isValidLength(value, min, max) {
        const length = value ? value.length : 0;
        return length >= min && length <= max;
    },

    /**
     * Validate to-do title
     */
    isValidTodoTitle(title) {
        return this.isRequired(title) && this.isValidLength(title, 1, 200);
    },

    /**
     * Validate to-do description
     */
    isValidTodoDescription(description) {
        // Description is optional, but if provided, must be valid length
        if (!description || description.trim() === '') return true;
        return this.isValidLength(description, 0, 1000);
    },

    /**
     * Validate priority
     */
    isValidPriority(priority) {
        return ['low', 'medium', 'high'].includes(priority);
    },

    /**
     * Validate status
     */
    isValidStatus(status) {
        return ['pending', 'completed'].includes(status);
    },

    /**
     * Validate date
     */
    isValidDate(date) {
        if (!date) return true; // Optional
        const dateObj = new Date(date);
        return dateObj instanceof Date && !isNaN(dateObj);
    },

    /**
     * Sanitize input to prevent XSS
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;

        // Remove HTML tags
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    /**
     * Get validation error message
     */
    getErrorMessage(field, value) {
        switch (field) {
            case 'email':
                if (!this.isRequired(value)) return 'Email is required';
                if (!this.isValidEmail(value)) return 'Invalid email format';
                break;
            case 'password':
                if (!this.isRequired(value)) return 'Password is required';
                if (!this.isValidPassword(value)) return 'Password must be at least 6 characters';
                break;
            case 'name':
                if (!this.isRequired(value)) return 'Name is required';
                if (!this.isValidLength(value, 2, 50)) return 'Name must be 2-50 characters';
                break;
            case 'title':
                if (!this.isRequired(value)) return 'Title is required';
                if (!this.isValidLength(value, 1, 200)) return 'Title must be 1-200 characters';
                break;
            case 'description':
                if (!this.isValidTodoDescription(value)) return 'Description must be less than 1000 characters';
                break;
            default:
                return null;
        }
        return null;
    },

    /**
     * Validate form data
     */
    validateForm(formData, rules) {
        const errors = {};

        Object.keys(rules).forEach(field => {
            const value = formData[field];
            const rule = rules[field];

            if (rule.required && !this.isRequired(value)) {
                errors[field] = `${field} is required`;
            } else if (rule.email && !this.isValidEmail(value)) {
                errors[field] = 'Invalid email format';
            } else if (rule.minLength && value.length < rule.minLength) {
                errors[field] = `Minimum length is ${rule.minLength}`;
            } else if (rule.maxLength && value.length > rule.maxLength) {
                errors[field] = `Maximum length is ${rule.maxLength}`;
            } else if (rule.custom && !rule.custom(value)) {
                errors[field] = rule.message || 'Invalid value';
            }
        });

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};
