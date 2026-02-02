import { formatDate, isOverdue, getPriorityColor, getStatusColor } from '../../utils/helpers';
import './Tasks.css';

const TaskItem = ({ task, onEdit, onDelete, onStatusChange }) => {
    const priorityColor = getPriorityColor(task.priority);
    const overdue = isOverdue(task.due_date);

    return (
        <div className="task-item">
            <div className="task-item-header">
                <span
                    className="priority-badge"
                    style={{ backgroundColor: priorityColor }}
                >
                    {task.priority}
                </span>

                <select
                    className={`status-badge ${task.status}`}
                    value={task.status}
                    onChange={(e) => onStatusChange(task._id, e.target.value)}
                    style={{
                        border: 'none',
                        cursor: 'pointer',
                        outline: 'none',
                        appearance: 'none',
                        textAlign: 'center'
                    }}
                >
                    <option value="pending">PENDING</option>
                    <option value="in-progress">IN PROGRESS</option>
                    <option value="completed">COMPLETED</option>
                </select>
            </div>

            <h3 className="task-title">{task.title}</h3>

            {task.description && (
                <p className="task-description">{task.description}</p>
            )}

            <div className="task-footer">
                <div className="task-meta">
                    {overdue && <span style={{ color: '#ef4444', marginRight: '8px' }}>⚠️ Overdue</span>}
                    {formatDate(task.due_date)}
                </div>

                <div className="task-actions">
                    <button className="btn-icon" onClick={() => onEdit(task)} title="Edit">
                        ✏️
                    </button>
                    <button className="btn-icon delete" onClick={() => onDelete(task._id)} title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskItem;
