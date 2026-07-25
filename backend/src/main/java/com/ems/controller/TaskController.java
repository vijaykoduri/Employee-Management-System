package com.ems.controller;

import com.ems.dto.TaskDTO;
import com.ems.entity.TaskStatus;
import com.ems.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskDTO>> getProjectTasks(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getProjectTasks(projectId));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<TaskDTO>> getEmployeeTasks(@PathVariable Long employeeId) {
        return ResponseEntity.ok(taskService.getEmployeeTasks(employeeId));
    }

    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@Valid @RequestBody TaskDTO dto) {
        return ResponseEntity.ok(taskService.createTask(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable Long id, @Valid @RequestBody TaskDTO dto) {
        return ResponseEntity.ok(taskService.updateTask(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskDTO> updateTaskStatus(@PathVariable Long id, @RequestParam TaskStatus status) {
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok("Task deleted successfully.");
    }
}
