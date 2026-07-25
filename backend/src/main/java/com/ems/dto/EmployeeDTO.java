package com.ems.dto;

import com.ems.entity.Role;
import com.ems.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDTO {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phoneNumber;
    private Role role;
    private Long departmentId;
    private String departmentName;
    private Long managerId;
    private String managerName;
    private String photoPath;
    private String gender;
    private LocalDate joiningDate;
    private Status status;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String education;
    private String experience;
    private BigDecimal baseSalary;
    private String bankName;
    private String bankAccountNo;
    private String bankIfsc;
    private String designation;
    private boolean twoFactorEnabled;
}
