// Todo Service
// Handles all to-do CRUD operations with Firestore

import { db } from '../utils/firebase.init.js';
import { Validators } from '../utils/validators.js';

export const TodoService = {
    /**
     * Create a new to-do
     */
    async createTodo(todoData, ownerUID) {
        try {
            // Validate input
            if (!Validators.isValidTodoTitle(todoData.title)) {
                throw new Error('Invalid todo title');
            }
            if (!Validators.isValidTodoDescription(todoData.description)) {
                throw new Error('Invalid todo description');
            }

            const todo = {
                title: todoData.title.trim(),
                description: todoData.description ? todoData.description.trim() : '',
                status: 'pending',
                priority: todoData.priority || 'medium',
                dueDate: todoData.dueDate ? firebase.firestore.Timestamp.fromDate(new Date(todoData.dueDate)) : null,
                ownerUID: ownerUID,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await db.collection('todos').add(todo);

            return {
                id: docRef.id,
                ...todo,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        } catch (error) {
            console.error('Error creating todo:', error);
            throw new Error(error.message || 'Failed to create to-do');
        }
    },

    /**
     * Get all todos for a user
     */
    async getTodos(ownerUID, filters = {}) {
        try {
            let query = db.collection('todos')
                .where('ownerUID', '==', ownerUID);

            // Apply filters
            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }
            if (filters.priority) {
                query = query.where('priority', '==', filters.priority);
            }

            // Order by creation date (newest first)
            query = query.orderBy('createdAt', 'desc');

            const snapshot = await query.get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting todos:', error);
            throw new Error('Failed to get to-dos');
        }
    },

    /**
     * Get a single todo by ID
     */
    async getTodo(todoId, ownerUID) {
        try {
            const doc = await db.collection('todos').doc(todoId).get();

            if (!doc.exists) {
                throw new Error('To-do not found');
            }

            const todo = {
                id: doc.id,
                ...doc.data()
            };

            // Verify ownership
            if (todo.ownerUID !== ownerUID) {
                throw new Error('Unauthorized access');
            }

            return todo;
        } catch (error) {
            console.error('Error getting todo:', error);
            throw new Error(error.message || 'Failed to get to-do');
        }
    },

    /**
     * Update a todo
     */
    async updateTodo(todoId, updates, ownerUID) {
        try {
            const todoRef = db.collection('todos').doc(todoId);
            const doc = await todoRef.get();

            if (!doc.exists) {
                throw new Error('To-do not found');
            }

            // Verify ownership
            if (doc.data().ownerUID !== ownerUID) {
                throw new Error('Unauthorized access');
            }

            // Validate updates
            if (updates.title && !Validators.isValidTodoTitle(updates.title)) {
                throw new Error('Invalid todo title');
            }
            if (updates.description !== undefined && !Validators.isValidTodoDescription(updates.description)) {
                throw new Error('Invalid todo description');
            }
            if (updates.status && !Validators.isValidStatus(updates.status)) {
                throw new Error('Invalid status');
            }
            if (updates.priority && !Validators.isValidPriority(updates.priority)) {
                throw new Error('Invalid priority');
            }

            // Prepare update data
            const updateData = {
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (updates.title !== undefined) updateData.title = updates.title.trim();
            if (updates.description !== undefined) updateData.description = updates.description.trim();
            if (updates.status !== undefined) updateData.status = updates.status;
            if (updates.priority !== undefined) updateData.priority = updates.priority;
            if (updates.dueDate !== undefined) {
                updateData.dueDate = updates.dueDate
                    ? firebase.firestore.Timestamp.fromDate(new Date(updates.dueDate))
                    : null;
            }

            await todoRef.update(updateData);

            return await this.getTodo(todoId, ownerUID);
        } catch (error) {
            console.error('Error updating todo:', error);
            throw new Error(error.message || 'Failed to update to-do');
        }
    },

    /**
     * Toggle todo status (pending <-> completed)
     */
    async toggleTodoStatus(todoId, ownerUID) {
        try {
            const todo = await this.getTodo(todoId, ownerUID);
            const newStatus = todo.status === 'pending' ? 'completed' : 'pending';

            return await this.updateTodo(todoId, { status: newStatus }, ownerUID);
        } catch (error) {
            console.error('Error toggling todo status:', error);
            throw new Error(error.message || 'Failed to toggle to-do status');
        }
    },

    /**
     * Delete a todo
     */
    async deleteTodo(todoId, ownerUID) {
        try {
            const todoRef = db.collection('todos').doc(todoId);
            const doc = await todoRef.get();

            if (!doc.exists) {
                throw new Error('To-do not found');
            }

            // Verify ownership
            if (doc.data().ownerUID !== ownerUID) {
                throw new Error('Unauthorized access');
            }

            await todoRef.delete();
        } catch (error) {
            console.error('Error deleting todo:', error);
            throw new Error(error.message || 'Failed to delete to-do');
        }
    },

    /**
     * Delete all completed todos
     */
    async deleteCompletedTodos(ownerUID) {
        try {
            const snapshot = await db.collection('todos')
                .where('ownerUID', '==', ownerUID)
                .where('status', '==', 'completed')
                .get();

            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            return snapshot.size;
        } catch (error) {
            console.error('Error deleting completed todos:', error);
            throw new Error('Failed to delete completed to-dos');
        }
    },

    /**
     * Search todos
     */
    async searchTodos(ownerUID, searchTerm) {
        try {
            const todos = await this.getTodos(ownerUID);

            if (!searchTerm || searchTerm.trim() === '') {
                return todos;
            }

            const term = searchTerm.toLowerCase();

            return todos.filter(todo =>
                todo.title.toLowerCase().includes(term) ||
                (todo.description && todo.description.toLowerCase().includes(term))
            );
        } catch (error) {
            console.error('Error searching todos:', error);
            throw new Error('Failed to search to-dos');
        }
    },

    /**
     * Listen to todos changes (real-time)
     */
    onTodosChanged(ownerUID, callback, filters = {}) {
        let query = db.collection('todos')
            .where('ownerUID', '==', ownerUID);

        // Apply filters
        if (filters.status) {
            query = query.where('status', '==', filters.status);
        }
        if (filters.priority) {
            query = query.where('priority', '==', filters.priority);
        }

        // Order by creation date
        query = query.orderBy('createdAt', 'desc');

        return query.onSnapshot(
            (snapshot) => {
                const todos = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                callback(todos);
            },
            (error) => {
                console.error('Error listening to todos:', error);
                callback([]);
            }
        );
    },

    /**
     * Get todos statistics
     */
    async getTodosStats(ownerUID) {
        try {
            const todos = await this.getTodos(ownerUID);

            const now = new Date();
            const overdueTodos = todos.filter(todo =>
                todo.status === 'pending' &&
                todo.dueDate &&
                todo.dueDate.toDate() < now
            );

            return {
                total: todos.length,
                pending: todos.filter(t => t.status === 'pending').length,
                completed: todos.filter(t => t.status === 'completed').length,
                overdue: overdueTodos.length,
                highPriority: todos.filter(t => t.priority === 'high' && t.status === 'pending').length,
                mediumPriority: todos.filter(t => t.priority === 'medium' && t.status === 'pending').length,
                lowPriority: todos.filter(t => t.priority === 'low' && t.status === 'pending').length
            };
        } catch (error) {
            console.error('Error getting todos stats:', error);
            return {
                total: 0,
                pending: 0,
                completed: 0,
                overdue: 0,
                highPriority: 0,
                mediumPriority: 0,
                lowPriority: 0
            };
        }
    }
};
