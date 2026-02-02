export const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
};

export const getPriorityColor = (priority) => {
    const colors = {
        low: '#10b981',
        medium: '#f59e0b',
        high: '#ef4444',
        critical: '#dc2626'
    };
    return colors[priority] || colors.medium;
};

export const getStatusColor = (status) => {
    const colors = {
        pending: '#6b7280',
        'in-progress': '#3b82f6',
        completed: '#10b981'
    };
    return colors[status] || colors.pending;
};
