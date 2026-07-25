package com.ems.controller;

import com.ems.dto.ProjectDTO;
import com.ems.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<ProjectDTO>> getEmployeeProjects(@PathVariable Long employeeId) {
        return ResponseEntity.ok(projectService.getEmployeeProjects(employeeId));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<ProjectDTO>> getDepartmentProjects(@PathVariable Long departmentId) {
        return ResponseEntity.ok(projectService.getDepartmentProjects(departmentId));
    }

    @PostMapping
    public ResponseEntity<ProjectDTO> createProject(@Valid @RequestBody ProjectDTO dto) {
        return ResponseEntity.ok(projectService.createProject(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTO> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectDTO dto) {
        return ResponseEntity.ok(projectService.updateProject(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok("Project deleted successfully.");
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<ProjectDTO> assignEmployees(@PathVariable Long id, @RequestBody Set<Long> employeeIds) {
        return ResponseEntity.ok(projectService.assignEmployeesToProject(id, employeeIds));
    }
}
