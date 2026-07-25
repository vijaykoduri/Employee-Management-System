package com.ems.service.impl;

import com.ems.dto.TaskDTO;
import com.ems.entity.Employee;
import com.ems.entity.Project;
import com.ems.entity.Task;
import com.ems.entity.TaskStatus;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.ProjectRepository;
import com.ems.repository.TaskRepository;
import com.ems.service.TaskService;
import com.ems.service.AuditLogService;
import com.ems.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskRepository taskRepository;

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
    public TaskDTO getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + id));
        return convertToDTO(task);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDTO> getProjectTasks(Long projectId) {
        return taskRepository.findByProjectId(projectId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDTO> getEmployeeTasks(Long employeeId) {
        return taskRepository.findByEmployeeId(employeeId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TaskDTO createTask(TaskDTO dto) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        Employee employee = null;
        if (dto.getEmployeeId() != null) {
            employee = employeeRepository.findById(dto.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));
        }

        Task task = Task.builder()
                .project(project)
                .employee(employee)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .deadline(dto.getDeadline())
                .status(dto.getStatus() != null ? dto.getStatus() : TaskStatus.TODO)
                .build();

        Task saved = taskRepository.save(task);
        auditLogService.log("SYSTEM", "CREATE_TASK", "Created task: " + saved.getTitle() + " under project " + project.getName());

        if (employee != null) {
            notificationService.sendNotification(employee, "New Task Assigned: " + saved.getTitle() + " (Project: " + project.getName() + ")");
        }

        return convertToDTO(saved);
    }

    @Override
    public TaskDTO updateTask(Long id, TaskDTO dto) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found."));

        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        Employee employee = null;
        if (dto.getEmployeeId() != null) {
            employee = employeeRepository.findById(dto.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));
        }

        // Check if employee assignment changed to trigger notification
        Employee finalEmployee = employee;
        boolean isNewAssignment = (employee != null) && (task.getEmployee() == null || !task.getEmployee().getId().equals(employee.getId()));

        task.setProject(project);
        task.setEmployee(employee);
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setDeadline(dto.getDeadline());
        task.setStatus(dto.getStatus());

        Task saved = taskRepository.save(task);
        auditLogService.log("SYSTEM", "UPDATE_TASK", "Updated task: " + saved.getTitle());

        if (isNewAssignment) {
            notificationService.sendNotification(finalEmployee, "New Task Assigned: " + saved.getTitle() + " (Project: " + project.getName() + ")");
        }

        return convertToDTO(saved);
    }

    @Override
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found."));
        taskRepository.delete(task);
        auditLogService.log("SYSTEM", "DELETE_TASK", "Deleted task: " + task.getTitle());
    }

    @Override
    public TaskDTO updateTaskStatus(Long taskId, TaskStatus status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found."));

        task.setStatus(status);
        Task saved = taskRepository.save(task);

        if (task.getEmployee() != null) {
            auditLogService.log(task.getEmployee().getUsername(), "UPDATE_TASK_STATUS", "Moved task " + task.getTitle() + " to " + status);
        }

        return convertToDTO(saved);
    }

    private TaskDTO convertToDTO(Task task) {
        if (task == null) return null;
        return TaskDTO.builder()
                .id(task.getId())
                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())
                .employeeId(task.getEmployee() != null ? task.getEmployee().getId() : null)
                .employeeName(task.getEmployee() != null ? task.getEmployee().getFullName() : null)
                .title(task.getTitle())
                .description(task.getDescription())
                .deadline(task.getDeadline())
                .status(task.getStatus())
                .build();
    }
}
