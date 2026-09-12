import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getTasks, createTask, updateTask, deleteTask } from "../api";
import TaskForm from "../components/TaskForm.jsx";
import TaskItem from "../components/TaskItem.jsx";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({ status: "", priority: "", search: "" });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;

      const res = await getTasks(params);
      setTasks(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData);
      } else {
        await createTask(formData);
      }
      setShowForm(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      setError("Failed to save task.");
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      fetchTasks();
    } catch (err) {
      setError("Failed to delete task.");
    }
  };

  const handleToggleStatus = async (task, newStatus) => {
    try {
      await updateTask(task.id, { ...task, status: newStatus });
      fetchTasks();
    } catch (err) {
      setError("Failed to update task status.");
    }
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Task Manager</h1>
          <p className="greeting">Hi, {user.name || "there"}!</p>
        </div>
        <button className="btn-secondary" onClick={handleLogout}>
          Log Out
        </button>
      </header>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-num">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{stats.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{stats.inProgress}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{stats.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
        >
          + New Task
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <TaskForm
              initialTask={editingTask}
              onSubmit={handleCreateOrUpdate}
              onCancel={() => {
                setShowForm(false);
                setEditingTask(null);
              }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <p className="empty-state">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="empty-state">No tasks yet. Create your first one!</p>
      ) : (
        <div className="task-grid">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
