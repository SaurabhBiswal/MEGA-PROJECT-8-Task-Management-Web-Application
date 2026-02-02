import React, { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

// Added default prop for tasks to prevent crash
const Dashboard = ({ tasks = [] }) => {
    const { theme } = useTheme();

    const statusData = useMemo(() => {
        if (!tasks || !Array.isArray(tasks)) return [];

        const counts = { pending: 0, 'in-progress': 0, completed: 0 };
        tasks.forEach(task => {
            if (counts[task.status] !== undefined) counts[task.status]++;
        });
        return [
            { name: 'Pending', value: counts.pending, color: '#f59e0b' },
            { name: 'In Progress', value: counts['in-progress'], color: '#3b82f6' },
            { name: 'Completed', value: counts.completed, color: '#10b981' }
        ];
    }, [tasks]);

    const priorityData = useMemo(() => {
        if (!tasks || !Array.isArray(tasks)) return [];

        const counts = { low: 0, medium: 0, high: 0, critical: 0 };
        tasks.forEach(task => {
            if (counts[task.priority] !== undefined) counts[task.priority]++;
        });
        return [
            { name: 'Low', value: counts.low, color: '#10b981' },
            { name: 'Medium', value: counts.medium, color: '#3b82f6' },
            { name: 'High', value: counts.high, color: '#f59e0b' },
            { name: 'Critical', value: counts.critical, color: '#ef4444' }
        ];
    }, [tasks]);

    const isDark = theme === 'dark';
    const textColor = isDark ? '#e5e7eb' : '#374151';

    return (
        <div className="dashboard-container" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

            <div className="chart-card" style={{
                background: isDark ? '#1f2937' : 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Task Status</h3>
                <div style={{ height: '300px', width: '100%', minHeight: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: isDark ? '#374151' : 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: textColor
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-card" style={{
                background: isDark ? '#1f2937' : 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Priority Breakdown</h3>
                <div style={{ height: '300px', width: '100%', minHeight: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={priorityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                            <XAxis dataKey="name" stroke={textColor} />
                            <YAxis stroke={textColor} allowDecimals={false} />
                            <Tooltip
                                cursor={{ fill: isDark ? '#374151' : '#f3f4f6' }}
                                contentStyle={{
                                    backgroundColor: isDark ? '#1f2937' : 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: textColor
                                }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {priorityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
