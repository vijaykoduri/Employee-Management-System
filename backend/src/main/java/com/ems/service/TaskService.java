package com.ems.service;

import com.ems.dto.TaskDTO;
import com.ems.entity.TaskStatus;

import java.util.List;

public interface TaskService {
    TaskDTO getTaskById(Long id);
    List<TaskDTO> getProjectTasks(Long projectId);
    List<TaskDTO> getEmployeeTasks(Long employeeId);
    TaskDTO createTask(TaskDTO taskDTO);
    TaskDTO updateTask(Long id, TaskDTO taskDTO);
    void deleteTask(Long id);
    TaskDTO updateTaskStatus(Long taskId, TaskStatus status);
}
