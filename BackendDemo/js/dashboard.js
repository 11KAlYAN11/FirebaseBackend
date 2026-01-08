// Dashboard Page Controller
// Handles todo management, real-time updates, and UI interactions

import { AuthService } from './services/auth.service.js';
import { TodoService } from './services/todo.service.js';
import { UserService } from './services/user.service.js';
import { UIUtils } from './utils/ui.utils.js';
import { Validators } from './utils/validators.js';

class DashboardController {
    constructor() {
        this.currentUser = null;
        this.todos = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.editingTodoId = null;
        this.todosUnsubscribe = null;

        this.init();
    }

    async init() {
        // Check authentication
        AuthService.onAuthStateChanged(async (user) => {
            if (!user) {
                // Redirect to login
                window.location.href = 'index.html';
                return;
            }

            this.currentUser = user;
            await this.loadUserData();
            this.setupEventListeners();
            this.setupRealtimeListeners();
            this.loadTheme();
        });
    }

    async loadUserData() {
        try {
            // Update UI with user info
            const displayName = this.currentUser.displayName || this.currentUser.email.split('@')[0];
            document.getElementById('welcome-name').textContent = displayName;
            document.getElementById('user-name').textContent = displayName;

            if (this.currentUser.photoURL) {
                document.getElementById('user-avatar').src = this.currentUser.photoURL;
            } else {
                document.getElementById('user-avatar').src =
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;
            }

            // Load stats
            await this.updateStats();
        } catch (error) {
            console.error('Error loading user data:', error);
            UIUtils.showError('Failed to load user data');
        }
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

        // User menu
        const userAvatar = document.getElementById('user-avatar');
        const userDropdown = document.getElementById('user-dropdown');

        userAvatar.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            userDropdown.classList.remove('active');
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());

        // Add todo buttons
        document.getElementById('add-todo-btn').addEventListener('click', () => this.openTodoModal());
        document.getElementById('empty-add-btn').addEventListener('click', () => this.openTodoModal());

        // Modal
        document.getElementById('modal-close').addEventListener('click', () => this.closeTodoModal());
        document.getElementById('modal-cancel').addEventListener('click', () => this.closeTodoModal());
        document.getElementById('modal-save').addEventListener('click', () => this.saveTodo());

        // Close modal on overlay click
        document.getElementById('todo-modal').addEventListener('click', (e) => {
            if (e.target.id === 'todo-modal') {
                this.closeTodoModal();
            }
        });

        // Search
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', UIUtils.debounce((e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderTodos();
        }, 300));

        // Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderTodos();
            });
        });
    }

    setupRealtimeListeners() {
        // Listen to todos changes
        this.todosUnsubscribe = TodoService.onTodosChanged(
            this.currentUser.uid,
            (todos) => {
                this.todos = todos;
                this.renderTodos();
                this.updateStats();
            }
        );
    }

    async updateStats() {
        try {
            const stats = await TodoService.getTodosStats(this.currentUser.uid);

            document.getElementById('stat-total').textContent = stats.total;
            document.getElementById('stat-pending').textContent = stats.pending;
            document.getElementById('stat-completed').textContent = stats.completed;
            document.getElementById('stat-high-priority').textContent = stats.highPriority;
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    renderTodos() {
        const todoList = document.getElementById('todo-list');
        const emptyState = document.getElementById('empty-state');

        // Filter todos
        let filteredTodos = this.todos;

        // Apply status filter
        if (this.currentFilter !== 'all') {
            filteredTodos = filteredTodos.filter(todo => todo.status === this.currentFilter);
        }

        // Apply search filter
        if (this.searchTerm) {
            filteredTodos = filteredTodos.filter(todo =>
                todo.title.toLowerCase().includes(this.searchTerm) ||
                (todo.description && todo.description.toLowerCase().includes(this.searchTerm))
            );
        }

        // Show empty state if no todos
        if (filteredTodos.length === 0) {
            todoList.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        // Render todos
        todoList.innerHTML = filteredTodos.map(todo => this.renderTodoItem(todo)).join('');

        // Add event listeners
        this.attachTodoEventListeners();
    }

    renderTodoItem(todo) {
        const isCompleted = todo.status === 'completed';
        const dueDate = todo.dueDate ? UIUtils.formatDateTime(todo.dueDate) : '';

        return `
      <div class="todo-item ${isCompleted ? 'completed' : ''}" data-id="${todo.id}">
        <div class="todo-checkbox ${isCompleted ? 'checked' : ''}" data-id="${todo.id}"></div>
        <div class="todo-content">
          <div class="todo-title">${UIUtils.escapeHtml(todo.title)}</div>
          ${todo.description ? `<div class="todo-description">${UIUtils.escapeHtml(todo.description)}</div>` : ''}
          <div class="todo-meta">
            ${UIUtils.getPriorityBadge(todo.priority)}
            ${UIUtils.getStatusBadge(todo.status)}
            ${dueDate ? `<span style="color: var(--text-secondary); font-size: 0.875rem;">📅 ${dueDate}</span>` : ''}
          </div>
        </div>
        <div class="todo-actions">
          <button class="action-btn edit-btn" data-id="${todo.id}" title="Edit">
            ✏️
          </button>
          <button class="action-btn delete delete-btn" data-id="${todo.id}" title="Delete">
            🗑️
          </button>
        </div>
      </div>
    `;
    }

    attachTodoEventListeners() {
        // Checkbox toggle
        document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                const todoId = e.target.dataset.id;
                this.toggleTodoStatus(todoId);
            });
        });

        // Edit button
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const todoId = e.target.dataset.id;
                this.editTodo(todoId);
            });
        });

        // Delete button
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const todoId = e.target.dataset.id;
                this.deleteTodo(todoId);
            });
        });

        // Click on todo item to edit
        document.querySelectorAll('.todo-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.todo-checkbox') &&
                    !e.target.closest('.action-btn')) {
                    const todoId = item.dataset.id;
                    this.editTodo(todoId);
                }
            });
        });
    }

    async toggleTodoStatus(todoId) {
        try {
            await TodoService.toggleTodoStatus(todoId, this.currentUser.uid);
            // UI will update via real-time listener
        } catch (error) {
            console.error('Error toggling todo status:', error);
            UIUtils.showError(error.message);
        }
    }

    openTodoModal(todo = null) {
        const modal = document.getElementById('todo-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('todo-form');

        if (todo) {
            // Edit mode
            modalTitle.textContent = 'Edit Task';
            this.editingTodoId = todo.id;

            document.getElementById('todo-id').value = todo.id;
            document.getElementById('todo-title').value = todo.title;
            document.getElementById('todo-description').value = todo.description || '';
            document.getElementById('todo-priority').value = todo.priority || 'medium';

            if (todo.dueDate) {
                const date = todo.dueDate.toDate();
                const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16);
                document.getElementById('todo-due-date').value = localDateTime;
            }
        } else {
            // Add mode
            modalTitle.textContent = 'Add New Task';
            this.editingTodoId = null;
            form.reset();
        }

        modal.classList.add('active');
    }

    closeTodoModal() {
        const modal = document.getElementById('todo-modal');
        modal.classList.remove('active');
        this.editingTodoId = null;
        document.getElementById('todo-form').reset();
    }

    async saveTodo() {
        const form = document.getElementById('todo-form');
        const title = document.getElementById('todo-title').value.trim();
        const description = document.getElementById('todo-description').value.trim();
        const priority = document.getElementById('todo-priority').value;
        const dueDate = document.getElementById('todo-due-date').value;

        // Validate
        if (!Validators.isValidTodoTitle(title)) {
            UIUtils.showError('Please enter a valid title (1-200 characters)');
            return;
        }

        if (!Validators.isValidTodoDescription(description)) {
            UIUtils.showError('Description must be less than 1000 characters');
            return;
        }

        const saveBtn = document.getElementById('modal-save');
        UIUtils.setButtonLoading(saveBtn, true, 'Saving...');

        try {
            const todoData = {
                title,
                description,
                priority,
                dueDate: dueDate || null
            };

            if (this.editingTodoId) {
                // Update existing todo
                await TodoService.updateTodo(this.editingTodoId, todoData, this.currentUser.uid);
                UIUtils.showSuccess('Task updated successfully!');
            } else {
                // Create new todo
                await TodoService.createTodo(todoData, this.currentUser.uid);
                UIUtils.showSuccess('Task created successfully!');
            }

            this.closeTodoModal();
        } catch (error) {
            console.error('Error saving todo:', error);
            UIUtils.showError(error.message);
        } finally {
            UIUtils.setButtonLoading(saveBtn, false);
        }
    }

    editTodo(todoId) {
        const todo = this.todos.find(t => t.id === todoId);
        if (todo) {
            this.openTodoModal(todo);
        }
    }

    async deleteTodo(todoId) {
        UIUtils.confirm(
            'Are you sure you want to delete this task?',
            async () => {
                try {
                    await TodoService.deleteTodo(todoId, this.currentUser.uid);
                    UIUtils.showSuccess('Task deleted successfully!');
                } catch (error) {
                    console.error('Error deleting todo:', error);
                    UIUtils.showError(error.message);
                }
            }
        );
    }

    async handleLogout() {
        UIUtils.confirm(
            'Are you sure you want to logout?',
            async () => {
                try {
                    // Unsubscribe from listeners
                    if (this.todosUnsubscribe) {
                        this.todosUnsubscribe();
                    }

                    await AuthService.signOut();
                    UIUtils.showSuccess('Logged out successfully!');
                    // Redirect handled by auth state listener
                } catch (error) {
                    console.error('Error logging out:', error);
                    UIUtils.showError(error.message);
                }
            }
        );
    }

    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update icon
        document.getElementById('theme-icon').textContent = newTheme === 'light' ? '🌙' : '☀️';
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.getElementById('theme-icon').textContent = savedTheme === 'light' ? '🌙' : '☀️';
    }
}

// Initialize controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DashboardController();
});
