import './Tasks.css';

const TaskFilters = ({ filters, onFilterChange }) => {
    const handleChange = (e) => {
        onFilterChange({ [e.target.name]: e.target.value });
    };

    const clearFilters = () => {
        onFilterChange({ status: '', priority: '', search: '' });
    };

    return (
        <div className="task-filters">
            <div className="filter-left">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleChange}
                        placeholder="Search tasks..."
                        className="search-input"
                    />
                </div>
            </div>

            <div className="filter-right">
                <select
                    name="status"
                    value={filters.status}
                    onChange={handleChange}
                    className="filter-select"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>

                <select
                    name="priority"
                    value={filters.priority}
                    onChange={handleChange}
                    className="filter-select"
                >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>

                {(filters.status || filters.priority || filters.search) && (
                    <button className="btn-clear" onClick={clearFilters}>
                        × Clear
                    </button>
                )}
            </div>
        </div>
    );
};

export default TaskFilters;
