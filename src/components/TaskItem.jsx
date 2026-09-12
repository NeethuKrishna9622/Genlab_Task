import React from "react";

export default function TaskItem({ task, onEdit, onDelete, onToggleStatus }) {
  const priorityClass = `priority-${task.priority}`;
  const statusClass = `status-${task.status}`;

  return (
    <div className={`task-card ${statusClass}`}>
      <div className="task-card-header">
        <h3>{task.title}</h3>
        <span className={`badge ${priorityClass}`}>{task.priority}</span>
      </div>

      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-meta">
        <span className={`badge ${statusClass}`}>{task.status.replace("-", " ")}</span>
        {task.due_date && <span className="due-date">Due: {task.due_date}</span>}
      </div>

      <div className="task-actions">
        <select
          value={task.status}
          onChange={(e) => onToggleStatus(task, e.target.value)}
          title="Update status"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button className="btn-link" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button className="btn-link danger" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
