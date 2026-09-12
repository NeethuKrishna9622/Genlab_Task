package com.taskmanager.dto;

import java.time.LocalDate;

/**
 * Used for both create and update.
 * Jackson maps incoming JSON "due_date" -> dueDate because of the global
 * SNAKE_CASE naming strategy in application.properties.
 */
public class TaskRequest {

    private String title;
    private String description;
    private String status;
    private String priority;
    private LocalDate dueDate;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}
