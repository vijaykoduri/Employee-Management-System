package com.ems.service;

import com.ems.dto.LoginRequest;
import com.ems.dto.LoginResponse;
import com.ems.dto.RegisterRequest;
import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.entity.Role;
import com.ems.exception.BadRequestException;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.security.JwtTokenProvider;
import com.ems.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuthServiceImpl authService;

    private RegisterRequest registerRequest;
    private Employee mockEmployee;
    private Department mockDepartment;

    @BeforeEach
    public void setup() {
        registerRequest = new RegisterRequest();
        registerRequest.setFullName("John Doe");
        registerRequest.setUsername("johndoe");
        registerRequest.setEmail("john@ems.com");
        registerRequest.setPassword("password");
        registerRequest.setConfirmPassword("password");
        registerRequest.setRole(Role.EMPLOYEE);
        registerRequest.setDepartmentId(1L);

        mockDepartment = Department.builder()
                .id(1L)
                .name("IT")
                .description("IT Department")
                .build();

        mockEmployee = Employee.builder()
                .id(1L)
                .username("johndoe")
                .email("john@ems.com")
                .password("encoded_password")
                .fullName("John Doe")
                .role(Role.EMPLOYEE)
                .department(mockDepartment)
                .build();
    }

    @Test
    public void testRegister_Success() {
        when(employeeRepository.existsByUsername(registerRequest.getUsername())).thenReturn(false);
        when(employeeRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(departmentRepository.findById(registerRequest.getDepartmentId())).thenReturn(Optional.of(mockDepartment));
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encoded_password");
        when(employeeRepository.save(any(Employee.class))).thenReturn(mockEmployee);

        Employee registered = authService.register(registerRequest);

        assertNotNull(registered);
        assertEquals("johndoe", registered.getUsername());
        verify(employeeRepository, times(1)).save(any(Employee.class));
    }

    @Test
    public void testRegister_PasswordsDoNotMatch() {
        registerRequest.setConfirmPassword("wrong_password");

        assertThrows(BadRequestException.class, () -> {
            authService.register(registerRequest);
        });

        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @Test
    public void testLogin_InvalidRoleSelected() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsernameOrEmail("johndoe");
        loginRequest.setPassword("password");
        loginRequest.setRole(Role.HR_MANAGER); // Incorrect role selected

        when(employeeRepository.findByUsername(loginRequest.getUsernameOrEmail())).thenReturn(Optional.of(mockEmployee));

        assertThrows(BadRequestException.class, () -> {
            authService.login(loginRequest);
        });

        verify(authenticationManager, never()).authenticate(any());
    }
}
