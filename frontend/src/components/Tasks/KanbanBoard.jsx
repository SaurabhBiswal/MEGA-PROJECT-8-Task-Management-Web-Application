import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const KanbanBoard = ({ tasks, onStatusChange }) => {
    const columns = {
        pending: { title: 'Pending', items: [], color: '#f59e0b' },
        'in-progress': { title: 'In Progress', items: [], color: '#3b82f6' },
        completed: { title: 'Completed', items: [], color: '#10b981' }
    };

    // Group tasks by status
    tasks.forEach(task => {
        if (columns[task.status]) {
            columns[task.status].items.push(task);
        }
    });

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;

        if (source.droppableId !== destination.droppableId) {
            onStatusChange(draggableId, destination.droppableId);
        }
    };

    return (
        <div className="kanban-board" style={{ display: 'flex', gap: '20px', overflowX: 'auto', padding: '20px 0' }}>
            <DragDropContext onDragEnd={onDragEnd}>
                {Object.entries(columns).map(([columnId, column]) => (
                    <div key={columnId} style={{ flex: '1', minWidth: '300px' }}>
                        <div style={{
                            backgroundColor: column.color,
                            color: 'white',
                            padding: '10px',
                            borderRadius: '8px 8px 0 0',
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                            {column.title} ({column.items.length})
                        </div>
                        <Droppable droppableId={columnId}>
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    style={{
                                        background: snapshot.isDraggingOver ? 'rgba(0,0,0,0.05)' : 'transparent',
                                        padding: '10px',
                                        minHeight: '200px',
                                        border: '1px solid var(--border-color)',
                                        borderTop: 'none',
                                        borderRadius: '0 0 8px 8px'
                                    }}
                                >
                                    {column.items.map((task, index) => (
                                        <Draggable key={task._id} draggableId={task._id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{
                                                        userSelect: 'none',
                                                        padding: '16px',
                                                        margin: '0 0 8px 0',
                                                        backgroundColor: 'var(--card-bg)',
                                                        borderRadius: '8px',
                                                        boxShadow: snapshot.isDragging ? '0 5px 10px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
                                                        borderLeft: `4px solid ${task.priority === 'critical' ? '#ef4444' :
                                                                task.priority === 'high' ? '#f59e0b' :
                                                                    task.priority === 'medium' ? '#3b82f6' : '#10b981'
                                                            }`,
                                                        color: 'var(--text-primary)',
                                                        ...provided.draggableProps.style
                                                    }}
                                                >
                                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>{task.title}</h4>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                        <span>{new Date(task.due_date).toLocaleDateString()}</span>
                                                        <span style={{ textTransform: 'capitalize' }}>{task.priority}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </DragDropContext>
        </div>
    );
};

export default KanbanBoard;
