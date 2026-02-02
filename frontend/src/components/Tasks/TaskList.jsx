import { useState, useEffect } from 'react';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import TaskFilters from './TaskFilters';
import KanbanBoard from './KanbanBoard';
import { useAuth } from '../../context/AuthContext';
import { getTasks, createTask, updateTask, deleteTask } from '../../services/api';
import './Tasks.css';
import { io } from 'socket.io-client';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        search: ''
    });
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'board'
    const { user } = useAuth();

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await getTasks(filters);
            // Fix: Access nested data structure { success: true, data: { tasks: [] } }
            setTasks(response.data.data?.tasks || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [filters]);

    // Real-time updates
    useEffect(() => {
        const socketUrl = import.meta.env.VITE_API_URL
            ? import.meta.env.VITE_API_URL.replace('/api', '')
            : 'http://localhost:5000';

        const socket = io(socketUrl);

        if (user) {
            socket.emit('join_user_room', user.id);
        }

        socket.on('task_created', (newTask) => {
            setTasks(prev => [newTask, ...prev]);
        });

        socket.on('task_updated', (updatedTask) => {
            setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
        });

        socket.on('task_deleted', (taskId) => {
            setTasks(prev => prev.filter(t => t._id !== taskId));
        });

        return () => socket.disconnect();
    }, [user]);

    const handleCreateTask = async (taskData) => {
        try {
            await createTask(taskData);
            setShowForm(false);
            // fetchTasks(); // Handled by socket now
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    };

    const handleUpdateTask = async (id, taskData) => {
        try {
            await updateTask(id, taskData);
            setEditingTask(null);
            setShowForm(false);
            // fetchTasks(); // Handled by socket
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    };

    const handleDeleteTask = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteTask(id);
                // fetchTasks(); // Handled by socket
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }
    };

    const handleKanbanStatusChange = async (taskId, newStatus) => {
        // Optimistic update
        const taskToUpdate = tasks.find(t => t._id === taskId);
        if (!taskToUpdate) return;

        const originalStatus = taskToUpdate.status;

        // Update local state immediately for smooth drag
        setTasks(prev => prev.map(t =>
            t._id === taskId ? { ...t, status: newStatus } : t
        ));

        try {
            // Call API
            await updateTask(taskId, { ...taskToUpdate, status: newStatus });
        } catch (error) {
            console.error("Failed to update status via drag and drop", error);
            // Revert on error
            setTasks(prev => prev.map(t =>
                t._id === taskId ? { ...t, status: originalStatus } : t
            ));
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleEditClick = (task) => {
        setEditingTask(task);
        setShowForm(true);
    };

    return (
        <div className="task-list-container">
            <div className="task-header">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <h2>My Tasks</h2>
                    <div className="view-toggle" style={{
                        background: 'var(--card-bg)',
                        padding: '4px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        gap: '4px'
                    }}>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                background: viewMode === 'list' ? 'var(--primary-color)' : 'transparent',
                                color: viewMode === 'list' ? 'white' : 'var(--text-secondary)',
                                border: 'none',
                                padding: '4px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('board')}
                            style={{
                                background: viewMode === 'board' ? 'var(--primary-color)' : 'transparent',
                                color: viewMode === 'board' ? 'white' : 'var(--text-secondary)',
                                border: 'none',
                                padding: '4px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Board
                        </button>
                    </div>
                </div>
                <button className="btn-primary" onClick={() => {
                    setEditingTask(null);
                    setShowForm(true);
                }}>
                    + Add Task
                </button>
            </div>

            <TaskFilters filters={filters} onFilterChange={handleFilterChange} />

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <TaskForm
                            onSubmit={editingTask ? (id, data) => handleUpdateTask(id, data) : handleCreateTask}
                            task={editingTask}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loading">Loading tasks...</div>
            ) : tasks.length === 0 ? (
                <div className="no-tasks">
                    <p>No tasks found. Create one to get started!</p>
                </div>
            ) : (
                viewMode === 'list' ? (
                    <div className="tasks-grid">
                        {tasks.map(task => (
                            <TaskItem
                                key={task._id}
                                task={task}
                                onDelete={handleDeleteTask}
                                onEdit={handleEditClick}
                                onStatusChange={handleKanbanStatusChange}
                            />
                        ))}
                    </div>
                ) : (
                    <KanbanBoard
                        tasks={tasks}
                        onStatusChange={handleKanbanStatusChange}
                    />
                )
            )}
        </div>
    );
};

export default TaskList;
