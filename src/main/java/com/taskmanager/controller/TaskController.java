package com.taskmanager.controller;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.exception.ApiException;
import com.taskmanager.model.Task;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.TaskSpecifications;
import com.taskmanager.security.AuthPrincipal;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    // ---- GET /api/tasks?status=&priority=&search= ----
    @GetMapping
    public List<Task> list(
            @AuthenticationPrincipal AuthPrincipal principal,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search
    ) {
        Specification<Task> spec = TaskSpecifications.belongsToUser(principal.id());

        if (status != null && !status.isBlank()) {
            spec = spec.and(TaskSpecifications.hasStatus(status));
        }
        if (priority != null && !priority.isBlank()) {
            spec = spec.and(TaskSpecifications.hasPriority(priority));
        }
        if (search != null && !search.isBlank()) {
            spec = spec.and(TaskSpecifications.matchesSearch(search));
        }

        return taskRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    // ---- GET /api/tasks/{id} ----
    @GetMapping("/{id}")
    public Task getOne(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable Long id) {
        return taskRepository.findByIdAndUserId(id, principal.id())
                .orElseThrow(() -> ApiException.notFound("Task not found."));
    }

    // ---- POST /api/tasks ----
    @PostMapping
    public ResponseEntity<Task> create(@AuthenticationPrincipal AuthPrincipal principal, @RequestBody TaskRequest req) {
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw ApiException.badRequest("Title is required.");
        }

        Task task = new Task();
        task.setUserId(principal.id());
        task.setTitle(req.getTitle());
        task.setDescription(req.getDescription() != null ? req.getDescription() : "");
        task.setStatus(req.getStatus() != null ? req.getStatus() : "pending");
        task.setPriority(req.getPriority() != null ? req.getPriority() : "medium");
        task.setDueDate(req.getDueDate());

        Task saved = taskRepository.save(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ---- PUT /api/tasks/{id} ----
    @PutMapping("/{id}")
    public Task update(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable Long id,
            @RequestBody TaskRequest req
    ) {
        Task task = taskRepository.findByIdAndUserId(id, principal.id())
                .orElseThrow(() -> ApiException.notFound("Task not found."));

        if (req.getTitle() != null) task.setTitle(req.getTitle());
        if (req.getDescription() != null) task.setDescription(req.getDescription());
        if (req.getStatus() != null) task.setStatus(req.getStatus());
        if (req.getPriority() != null) task.setPriority(req.getPriority());
        if (req.getDueDate() != null) task.setDueDate(req.getDueDate());

        return taskRepository.save(task);
    }

    // ---- DELETE /api/tasks/{id} ----
    @DeleteMapping("/{id}")
    public Map<String, String> delete(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable Long id) {
        Task task = taskRepository.findByIdAndUserId(id, principal.id())
                .orElseThrow(() -> ApiException.notFound("Task not found."));

        taskRepository.delete(task);
        return Map.of("message", "Task deleted successfully.");
    }
}
