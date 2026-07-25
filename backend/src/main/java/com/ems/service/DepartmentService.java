package com.ems.service;

import com.ems.dto.DepartmentDTO;

import java.util.List;

public interface DepartmentService {
    DepartmentDTO getDepartmentById(Long id);
    List<DepartmentDTO> getAllDepartments();
    DepartmentDTO createDepartment(DepartmentDTO departmentDTO);
    DepartmentDTO updateDepartment(Long id, DepartmentDTO departmentDTO);
    void deleteDepartment(Long id);
    DepartmentDTO assignManager(Long departmentId, Long managerId);
}
