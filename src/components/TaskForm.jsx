import React, { useState, useEffect } from "react";

const emptyTask = {
  title: "",
  description: "",
  status: "pending",
  priority: "medium",
  due_date: "",
};

export default function TaskForm({ onSubmit, onCancel, initialTask }) {
  const [form, setForm] = useState(emptyTask);

  useEffect(() => {
    if (initialTask) {
      setForm({
        title: initialTask.title || "",
        description: initialTask.description || "",
        status: initialTask.status || "pending",
        priority: initialTask.priority || "medium",
        due_date: initialTask.due_date || "",
      });
    } else {
      setForm(emptyTask);
    }
  }, [initialTask]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>{initialTask ? "Edit Task" : "New Task"}</h2>

      <label>Title</label>
      <input
        type="text"
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Task title"
        required
      />

      <label>Description</label>
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Details about the task..."
        rows={3}
      />

      <div className="form-row">
        <div>
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label>Priority</label>
          <select name="priority" value={form.priority} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label>Due Date</label>
          <input type="date" name="due_date" value={form.due_date || ""} onChange={handleChange} />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {initialTask ? "Save Changes" : "Add Task"}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
