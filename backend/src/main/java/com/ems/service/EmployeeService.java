package com.ems.service;

import com.ems.dto.EmployeeDTO;
import com.ems.entity.Employee;
import com.ems.entity.Role;
import com.ems.entity.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EmployeeService {
    EmployeeDTO getEmployeeById(Long id);
    Employee getEmployeeEntityById(Long id);
    Page<EmployeeDTO> getAllEmployees(String searchTerm, Role role, Status status, Long departmentId, Pageable pageable);
    List<EmployeeDTO> getAllEmployeesRaw();
    EmployeeDTO createEmployee(EmployeeDTO employeeDTO);
    EmployeeDTO updateEmployee(Long id, EmployeeDTO employeeDTO);
    void deleteEmployee(Long id);
    EmployeeDTO updateProfile(Long id, EmployeeDTO employeeDTO);
    void changePassword(Long id, String oldPassword, String newPassword);
    void updatePhoto(Long id, String photoPath);
    void toggleTwoFactor(Long id, boolean enabled);
    List<EmployeeDTO> getEmployeesByDepartment(Long departmentId);
    List<EmployeeDTO> getEmployeesByManager(Long managerId);
    EmployeeDTO convertToDTO(Employee employee);
}
