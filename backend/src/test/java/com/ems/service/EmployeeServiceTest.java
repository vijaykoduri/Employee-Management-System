package com.ems.service;

import com.ems.dto.EmployeeDTO;
import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.entity.Role;
import com.ems.entity.Status;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.service.impl.EmployeeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private Employee employee;
    private Department department;

    @BeforeEach
    public void setup() {
        department = Department.builder()
                .id(1L)
                .name("IT")
                .description("IT Department")
                .build();

        employee = Employee.builder()
                .id(1L)
                .username("johndoe")
                .email("john@ems.com")
                .password("encoded")
                .fullName("John Doe")
                .role(Role.EMPLOYEE)
                .department(department)
                .status(Status.ACTIVE)
                .baseSalary(new BigDecimal("50000"))
                .build();
    }

    @Test
    public void testGetEmployeeById_Success() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        EmployeeDTO dto = employeeService.getEmployeeById(1L);

        assertNotNull(dto);
        assertEquals("John Doe", dto.getFullName());
        assertEquals("IT", dto.getDepartmentName());
    }

    @Test
    public void testGetEmployeeById_NotFound() {
        when(employeeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            employeeService.getEmployeeById(99L);
        });
    }
}
