package com.ems.service.impl;

import com.ems.dto.DepartmentDTO;
import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.service.DepartmentService;
import com.ems.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DepartmentServiceImpl implements DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public DepartmentDTO getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));
        return convertToDTO(department);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DepartmentDTO createDepartment(DepartmentDTO dto) {
        if (departmentRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Department name is already in use.");
        }

        Employee manager = null;
        if (dto.getManagerId() != null) {
            manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found."));
        }

        Department department = Department.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .manager(manager)
                .build();

        Department saved = departmentRepository.save(department);
        auditLogService.log("SYSTEM", "CREATE_DEPARTMENT", "Created department: " + saved.getName());
        return convertToDTO(saved);
    }

    @Override
    public DepartmentDTO updateDepartment(Long id, DepartmentDTO dto) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));

        if (!department.getName().equals(dto.getName()) && departmentRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Department name is already in use.");
        }

        Employee manager = null;
        if (dto.getManagerId() != null) {
            manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found."));
        }

        department.setName(dto.getName());
        department.setDescription(dto.getDescription());
        department.setManager(manager);

        Department updated = departmentRepository.save(department);
        auditLogService.log("SYSTEM", "UPDATE_DEPARTMENT", "Updated department: " + updated.getName());
        return convertToDTO(updated);
    }

    @Override
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found."));

        // If there are employees assigned, reassign them or block deletion
        List<Employee> employees = employeeRepository.findByDepartmentId(id);
        if (!employees.isEmpty()) {
            throw new BadRequestException("Cannot delete department because it contains active employees. Reassign them first.");
        }

        departmentRepository.delete(department);
        auditLogService.log("SYSTEM", "DELETE_DEPARTMENT", "Deleted department: " + department.getName());
    }

    @Override
    public DepartmentDTO assignManager(Long departmentId, Long managerId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found."));

        Employee manager = employeeRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));

        department.setManager(manager);
        Department updated = departmentRepository.save(department);
        auditLogService.log("SYSTEM", "ASSIGN_DEPT_MANAGER", "Assigned manager " + manager.getFullName() + " to department " + department.getName());
        return convertToDTO(updated);
    }

    private DepartmentDTO convertToDTO(Department department) {
        if (department == null) return null;
        long empCount = employeeRepository.findByDepartmentId(department.getId()).size();
        return DepartmentDTO.builder()
                .id(department.getId())
                .name(department.getName())
                .description(department.getDescription())
                .managerId(department.getManager() != null ? department.getManager().getId() : null)
                .managerName(department.getManager() != null ? department.getManager().getFullName() : null)
                .employeeCount(empCount)
                .build();
    }
}
