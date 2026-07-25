package com.ems.service.impl;

import com.ems.dto.EmployeeDTO;
import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.entity.Role;
import com.ems.entity.Status;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.service.AuditLogService;
import com.ems.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public EmployeeDTO getEmployeeById(Long id) {
        Employee employee = getEmployeeEntityById(id);
        return convertToDTO(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public Employee getEmployeeEntityById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeDTO> getAllEmployees(String searchTerm, Role role, Status status, Long departmentId, Pageable pageable) {
        return employeeRepository.searchAndFilter(searchTerm, role, status, departmentId, pageable)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDTO> getAllEmployeesRaw() {
        return employeeRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeDTO createEmployee(EmployeeDTO dto) {
        if (employeeRepository.existsByUsername(dto.getUsername())) {
            throw new BadRequestException("Username is already in use.");
        }
        if (employeeRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email is already in use.");
        }

        Department department = null;
        if (dto.getDepartmentId() != null) {
            department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found."));
        } else if (dto.getRole() != Role.SUPER_ADMIN) {
            throw new BadRequestException("Department is mandatory for non-admin accounts.");
        }

        Employee manager = null;
        if (dto.getManagerId() != null) {
            manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found."));
        }

        Employee employee = Employee.builder()
                .username(dto.getUsername())
                .email(dto.getEmail())
                .password(passwordEncoder.encode("Password@123")) // default password
                .fullName(dto.getFullName())
                .phoneNumber(dto.getPhoneNumber())
                .role(dto.getRole())
                .department(department)
                .manager(manager)
                .designation(dto.getDesignation())
                .joiningDate(dto.getJoiningDate() != null ? dto.getJoiningDate() : LocalDate.now())
                .status(dto.getStatus() != null ? dto.getStatus() : Status.ACTIVE)
                .gender(dto.getGender())
                .emergencyContactName(dto.getEmergencyContactName())
                .emergencyContactPhone(dto.getEmergencyContactPhone())
                .education(dto.getEducation())
                .experience(dto.getExperience())
                .baseSalary(dto.getBaseSalary())
                .bankName(dto.getBankName())
                .bankAccountNo(dto.getBankAccountNo())
                .bankIfsc(dto.getBankIfsc())
                .twoFactorEnabled(false)
                .build();

        Employee saved = employeeRepository.save(employee);
        auditLogService.log("SYSTEM", "CREATE_EMPLOYEE", "Created employee profile for " + saved.getUsername());
        return convertToDTO(saved);
    }

    @Override
    public EmployeeDTO updateEmployee(Long id, EmployeeDTO dto) {
        Employee employee = getEmployeeEntityById(id);

        if (!employee.getUsername().equals(dto.getUsername()) && employeeRepository.existsByUsername(dto.getUsername())) {
            throw new BadRequestException("Username is already in use.");
        }
        if (!employee.getEmail().equals(dto.getEmail()) && employeeRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email is already in use.");
        }

        Department department = null;
        if (dto.getDepartmentId() != null) {
            department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found."));
        } else if (dto.getRole() != Role.SUPER_ADMIN) {
            throw new BadRequestException("Department is mandatory for non-admin accounts.");
        }

        Employee manager = null;
        if (dto.getManagerId() != null) {
            manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found."));
        }

        employee.setUsername(dto.getUsername());
        employee.setEmail(dto.getEmail());
        employee.setFullName(dto.getFullName());
        employee.setPhoneNumber(dto.getPhoneNumber());
        employee.setRole(dto.getRole());
        employee.setDepartment(department);
        employee.setManager(manager);
        employee.setDesignation(dto.getDesignation());
        employee.setStatus(dto.getStatus());
        employee.setGender(dto.getGender());
        employee.setEmergencyContactName(dto.getEmergencyContactName());
        employee.setEmergencyContactPhone(dto.getEmergencyContactPhone());
        employee.setEducation(dto.getEducation());
        employee.setExperience(dto.getExperience());
        employee.setBaseSalary(dto.getBaseSalary());
        employee.setBankName(dto.getBankName());
        employee.setBankAccountNo(dto.getBankAccountNo());
        employee.setBankIfsc(dto.getBankIfsc());

        Employee updated = employeeRepository.save(employee);
        auditLogService.log("SYSTEM", "UPDATE_EMPLOYEE", "Updated employee record for " + updated.getUsername());
        return convertToDTO(updated);
    }

    @Override
    public void deleteEmployee(Long id) {
        Employee employee = getEmployeeEntityById(id);
        employeeRepository.delete(employee);
        auditLogService.log("SYSTEM", "DELETE_EMPLOYEE", "Deleted employee record for " + employee.getUsername());
    }

    @Override
    public EmployeeDTO updateProfile(Long id, EmployeeDTO dto) {
        Employee employee = getEmployeeEntityById(id);

        employee.setFullName(dto.getFullName());
        employee.setPhoneNumber(dto.getPhoneNumber());
        employee.setGender(dto.getGender());
        employee.setEmergencyContactName(dto.getEmergencyContactName());
        employee.setEmergencyContactPhone(dto.getEmergencyContactPhone());
        employee.setEducation(dto.getEducation());
        employee.setExperience(dto.getExperience());
        employee.setBankName(dto.getBankName());
        employee.setBankAccountNo(dto.getBankAccountNo());
        employee.setBankIfsc(dto.getBankIfsc());

        Employee updated = employeeRepository.save(employee);
        auditLogService.log(employee.getUsername(), "UPDATE_PROFILE", "Updated personal profile details");
        return convertToDTO(updated);
    }

    @Override
    public void changePassword(Long id, String oldPassword, String newPassword) {
        Employee employee = getEmployeeEntityById(id);

        if (!passwordEncoder.matches(oldPassword, employee.getPassword())) {
            throw new BadRequestException("Current password does not match.");
        }

        employee.setPassword(passwordEncoder.encode(newPassword));
        employeeRepository.save(employee);
        auditLogService.log(employee.getUsername(), "CHANGE_PASSWORD", "Password modified successfully");
    }

    @Override
    public void updatePhoto(Long id, String photoPath) {
        Employee employee = getEmployeeEntityById(id);
        employee.setPhotoPath(photoPath);
        employeeRepository.save(employee);
        auditLogService.log(employee.getUsername(), "UPDATE_PHOTO", "Updated profile picture");
    }

    @Override
    public void toggleTwoFactor(Long id, boolean enabled) {
        Employee employee = getEmployeeEntityById(id);
        employee.setTwoFactorEnabled(enabled);
        employeeRepository.save(employee);
        auditLogService.log(employee.getUsername(), "TOGGLE_2FA", "Two-factor verification toggled to: " + enabled);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDTO> getEmployeesByDepartment(Long departmentId) {
        return employeeRepository.findByDepartmentId(departmentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDTO> getEmployeesByManager(Long managerId) {
        return employeeRepository.findByManagerId(managerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeDTO convertToDTO(Employee employee) {
        if (employee == null) return null;
        return EmployeeDTO.builder()
                .id(employee.getId())
                .username(employee.getUsername())
                .email(employee.getEmail())
                .fullName(employee.getFullName())
                .phoneNumber(employee.getPhoneNumber())
                .role(employee.getRole())
                .departmentId(employee.getDepartment() != null ? employee.getDepartment().getId() : null)
                .departmentName(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                .managerId(employee.getManager() != null ? employee.getManager().getId() : null)
                .managerName(employee.getManager() != null ? employee.getManager().getFullName() : null)
                .photoPath(employee.getPhotoPath())
                .gender(employee.getGender())
                .joiningDate(employee.getJoiningDate())
                .status(employee.getStatus())
                .emergencyContactName(employee.getEmergencyContactName())
                .emergencyContactPhone(employee.getEmergencyContactPhone())
                .education(employee.getEducation())
                .experience(employee.getExperience())
                .baseSalary(employee.getBaseSalary())
                .bankName(employee.getBankName())
                .bankAccountNo(employee.getBankAccountNo())
                .bankIfsc(employee.getBankIfsc())
                .designation(employee.getDesignation())
                .twoFactorEnabled(employee.isTwoFactorEnabled())
                .build();
    }
}
