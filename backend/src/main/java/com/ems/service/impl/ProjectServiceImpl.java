package com.ems.service.impl;

import com.ems.dto.ProjectDTO;
import com.ems.entity.Employee;
import com.ems.entity.Project;
import com.ems.entity.ProjectStatus;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.ProjectRepository;
import com.ems.service.ProjectService;
import com.ems.service.AuditLogService;
import com.ems.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProjectServiceImpl implements ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public ProjectDTO getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + id));
        return convertToDTO(project);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectDTO> getEmployeeProjects(Long employeeId) {
        return projectRepository.findByEmployeesId(employeeId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectDTO createProject(ProjectDTO dto) {
        if (projectRepository.findByName(dto.getName()).isPresent()) {
            throw new BadRequestException("Project name is already in use.");
        }

        Set<Employee> employees = new HashSet<>();
        if (dto.getEmployeeIds() != null) {
            employees.addAll(employeeRepository.findAllById(dto.getEmployeeIds()));
        }

        Project project = Project.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .deadline(dto.getDeadline())
                .status(dto.getStatus() != null ? dto.getStatus() : ProjectStatus.NOT_STARTED)
                .employees(employees)
                .build();

        Project saved = projectRepository.save(project);
        auditLogService.log("SYSTEM", "CREATE_PROJECT", "Created project: " + saved.getName());

        // Notify assigned employees
        for (Employee emp : employees) {
            notificationService.sendNotification(emp, "You have been assigned to project: " + saved.getName());
        }

        return convertToDTO(saved);
    }

    @Override
    public ProjectDTO updateProject(Long id, ProjectDTO dto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        if (!project.getName().equals(dto.getName()) && projectRepository.findByName(dto.getName()).isPresent()) {
            throw new BadRequestException("Project name is already in use.");
        }

        Set<Employee> updatedEmployees = new HashSet<>();
        if (dto.getEmployeeIds() != null) {
            updatedEmployees.addAll(employeeRepository.findAllById(dto.getEmployeeIds()));
        }

        // Detect newly assigned employees to trigger notifications
        Set<Employee> currentlyAssigned = project.getEmployees();
        Set<Employee> newlyAssigned = updatedEmployees.stream()
                .filter(e -> !currentlyAssigned.contains(e))
                .collect(Collectors.toSet());

        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setDeadline(dto.getDeadline());
        project.setStatus(dto.getStatus());
        project.setEmployees(updatedEmployees);

        Project saved = projectRepository.save(project);
        auditLogService.log("SYSTEM", "UPDATE_PROJECT", "Updated project details: " + saved.getName());

        // Notify new guys
        for (Employee emp : newlyAssigned) {
            notificationService.sendNotification(emp, "You have been assigned to project: " + saved.getName());
        }

        return convertToDTO(saved);
    }

    @Override
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
        projectRepository.delete(project);
        auditLogService.log("SYSTEM", "DELETE_PROJECT", "Deleted project: " + project.getName());
    }

    @Override
    public ProjectDTO assignEmployeesToProject(Long projectId, Set<Long> employeeIds) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        Set<Employee> employees = new HashSet<>(employeeRepository.findAllById(employeeIds));
        Set<Employee> currentlyAssigned = project.getEmployees();
        Set<Employee> newlyAssigned = employees.stream()
                .filter(e -> !currentlyAssigned.contains(e))
                .collect(Collectors.toSet());

        project.setEmployees(employees);
        Project saved = projectRepository.save(project);

        auditLogService.log("SYSTEM", "ASSIGN_PROJECT_STAFF", "Updated project team allocation for " + project.getName());

        for (Employee emp : newlyAssigned) {
            notificationService.sendNotification(emp, "You have been assigned to project: " + saved.getName());
        }

        return convertToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectDTO> getDepartmentProjects(Long departmentId) {
        return projectRepository.findByDepartmentId(departmentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ProjectDTO convertToDTO(Project p) {
        if (p == null) return null;
        Set<Long> ids = p.getEmployees().stream().map(Employee::getId).collect(Collectors.toSet());
        List<String> names = p.getEmployees().stream().map(Employee::getFullName).collect(Collectors.toList());
        return ProjectDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .deadline(p.getDeadline())
                .status(p.getStatus())
                .employeeIds(ids)
                .employeeNames(names)
                .build();
    }
}
