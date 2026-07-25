package com.ems.config;

import com.ems.entity.*;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Create Default Departments if none exist
        Department itDept = null;
        Department hrDept = null;

        if (departmentRepository.count() == 0) {
            itDept = Department.builder()
                    .name("Information Technology")
                    .description("Handles IT systems, networks, and software engineering")
                    .build();
            itDept = departmentRepository.save(itDept);

            hrDept = Department.builder()
                    .name("Human Resources")
                    .description("Handles talent acquisition, employee relations, and payroll")
                    .build();
            hrDept = departmentRepository.save(hrDept);
        } else {
            itDept = departmentRepository.findByName("Information Technology").orElse(null);
            hrDept = departmentRepository.findByName("Human Resources").orElse(null);
        }

        // 2. Create Default Users for all Roles if none exist
        if (employeeRepository.count() == 0) {
            String defaultPassword = passwordEncoder.encode("Password@123");

            // Super Admin
            Employee superAdmin = Employee.builder()
                    .username("admin")
                    .email("admin@ems.com")
                    .password(defaultPassword)
                    .fullName("Super Administrator")
                    .phoneNumber("+1234567890")
                    .role(Role.SUPER_ADMIN)
                    .status(Status.ACTIVE)
                    .joiningDate(LocalDate.of(2023, 1, 1))
                    .gender("Male")
                    .designation("System Owner")
                    .baseSalary(new BigDecimal("150000"))
                    .build();
            employeeRepository.save(superAdmin);

            // HR Manager (assigned to HR Department)
            Employee hrManager = Employee.builder()
                    .username("hr_manager")
                    .email("hr@ems.com")
                    .password(defaultPassword)
                    .fullName("Hannah HR Manager")
                    .phoneNumber("+1234567891")
                    .role(Role.HR_MANAGER)
                    .department(hrDept)
                    .status(Status.ACTIVE)
                    .joiningDate(LocalDate.of(2023, 3, 15))
                    .gender("Female")
                    .designation("Head HR")
                    .baseSalary(new BigDecimal("90000"))
                    .build();
            hrManager = employeeRepository.save(hrManager);
            if (hrDept != null) {
                hrDept.setManager(hrManager);
                departmentRepository.save(hrDept);
            }

            // Department Manager (assigned to IT Department)
            Employee deptManager = Employee.builder()
                    .username("dept_manager")
                    .email("dept@ems.com")
                    .password(defaultPassword)
                    .fullName("Donald Dept Manager")
                    .phoneNumber("+1234567892")
                    .role(Role.DEPARTMENT_MANAGER)
                    .department(itDept)
                    .status(Status.ACTIVE)
                    .joiningDate(LocalDate.of(2023, 2, 10))
                    .gender("Male")
                    .designation("IT Director")
                    .baseSalary(new BigDecimal("110000"))
                    .build();
            deptManager = employeeRepository.save(deptManager);
            if (itDept != null) {
                itDept.setManager(deptManager);
                departmentRepository.save(itDept);
            }

            // Team Lead (assigned to IT Department, reports to Department Manager)
            Employee teamLead = Employee.builder()
                    .username("team_lead")
                    .email("lead@ems.com")
                    .password(defaultPassword)
                    .fullName("Tanya Team Lead")
                    .phoneNumber("+1234567893")
                    .role(Role.TEAM_LEAD)
                    .department(itDept)
                    .manager(deptManager)
                    .status(Status.ACTIVE)
                    .joiningDate(LocalDate.of(2023, 6, 1))
                    .gender("Female")
                    .designation("Lead Engineer")
                    .baseSalary(new BigDecimal("75000"))
                    .build();
            teamLead = employeeRepository.save(teamLead);

            // Employee (assigned to IT Department, reports to Team Lead)
            Employee employee = Employee.builder()
                    .username("employee")
                    .email("emp@ems.com")
                    .password(defaultPassword)
                    .fullName("Edward Employee")
                    .phoneNumber("+1234567894")
                    .role(Role.EMPLOYEE)
                    .department(itDept)
                    .manager(teamLead)
                    .status(Status.ACTIVE)
                    .joiningDate(LocalDate.of(2024, 1, 10))
                    .gender("Male")
                    .designation("Software Engineer")
                    .baseSalary(new BigDecimal("50000"))
                    .build();
            employeeRepository.save(employee);
        }
    }
}
