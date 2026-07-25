package com.ems.service.impl;

import com.ems.dto.LoginRequest;
import com.ems.dto.LoginResponse;
import com.ems.dto.RegisterRequest;
import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.entity.Role;
import com.ems.entity.Status;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.security.JwtTokenProvider;
import com.ems.service.AuthService;
import com.ems.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Random;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    public Employee register(RegisterRequest request) {
        if (employeeRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already in use.");
        }
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use.");
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match.");
        }

        Department department = null;
        if (request.getRole() != Role.SUPER_ADMIN) {
            if (request.getDepartmentId() == null) {
                throw new BadRequestException("Department is mandatory for non-admin accounts.");
            }
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found."));
        }

        Employee employee = Employee.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .role(request.getRole())
                .department(department)
                .status(Status.ACTIVE)
                .joiningDate(LocalDate.now())
                .baseSalary(new BigDecimal("40000")) // default salary
                .designation(request.getRole().name() + " Staff")
                .twoFactorEnabled(false)
                .build();

        Employee saved = employeeRepository.save(employee);
        auditLogService.log(saved.getUsername(), "REGISTER", "Employee registered: " + saved.getUsername() + " with role " + saved.getRole());
        return saved;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        Employee employee = employeeRepository.findByUsername(request.getUsernameOrEmail())
                .or(() -> employeeRepository.findByEmail(request.getUsernameOrEmail()))
                .orElseThrow(() -> new BadRequestException("Invalid username/email or password."));

        // Critical Check: role must match selected role
        if (employee.getRole() != request.getRole()) {
            throw new BadRequestException("Invalid role selected.");
        }

        // Authenticate credentials
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        employee.getUsername(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Check if 2FA is enabled
        if (employee.isTwoFactorEnabled()) {
            String code = String.format("%06d", new Random().nextInt(1000000));
            employee.setTwoFactorCode(code);
            employeeRepository.save(employee);

            // Log code to System.out for demo/testing access
            System.out.println("=================================================");
            System.out.println("2FA Verification Code for " + employee.getUsername() + ": " + code);
            System.out.println("=================================================");

            auditLogService.log(employee.getUsername(), "LOGIN_2FA_PENDING", "Two-factor verification required.");
            return LoginResponse.builder()
                    .twoFactorRequired(true)
                    .username(employee.getUsername())
                    .email(employee.getEmail())
                    .role(employee.getRole())
                    .build();
        }

        String jwt = tokenProvider.generateToken(authentication);
        auditLogService.log(employee.getUsername(), "LOGIN_SUCCESS", "Successfully logged in.");

        return LoginResponse.builder()
                .accessToken(jwt)
                .role(employee.getRole())
                .username(employee.getUsername())
                .email(employee.getEmail())
                .fullName(employee.getFullName())
                .userId(employee.getId())
                .twoFactorRequired(false)
                .build();
    }

    @Override
    public LoginResponse verify2FA(String usernameOrEmail, String code) {
        Employee employee = employeeRepository.findByUsername(usernameOrEmail)
                .or(() -> employeeRepository.findByEmail(usernameOrEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (employee.getTwoFactorCode() == null || !employee.getTwoFactorCode().equals(code)) {
            throw new BadRequestException("Invalid 2FA code.");
        }

        // Clear code
        employee.setTwoFactorCode(null);
        employeeRepository.save(employee);

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                employee, null, employee.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        auditLogService.log(employee.getUsername(), "LOGIN_SUCCESS", "Successfully logged in via 2FA.");

        return LoginResponse.builder()
                .accessToken(jwt)
                .role(employee.getRole())
                .username(employee.getUsername())
                .email(employee.getEmail())
                .fullName(employee.getFullName())
                .userId(employee.getId())
                .twoFactorRequired(false)
                .build();
    }

    @Override
    public void forgotPassword(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No employee found with this email."));

        // In a production app, we would send an email with a reset link.
        // For this system, we log the reset event.
        System.out.println("Password reset requested for: " + email);
        auditLogService.log(employee.getUsername(), "PASSWORD_RESET_REQUEST", "Password reset request filed.");
    }
}
