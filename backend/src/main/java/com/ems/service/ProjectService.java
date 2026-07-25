package com.ems.service;

import com.ems.dto.ProjectDTO;

import java.util.List;
import java.util.Set;

public interface ProjectService {
    ProjectDTO getProjectById(Long id);
    List<ProjectDTO> getAllProjects();
    List<ProjectDTO> getEmployeeProjects(Long employeeId);
    ProjectDTO createProject(ProjectDTO projectDTO);
    ProjectDTO updateProject(Long id, ProjectDTO projectDTO);
    void deleteProject(Long id);
    ProjectDTO assignEmployeesToProject(Long projectId, Set<Long> employeeIds);
    List<ProjectDTO> getDepartmentProjects(Long departmentId);
}
