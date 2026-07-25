package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String month;
    private BigDecimal baseSalary;
    private BigDecimal bonus;
    private BigDecimal deductions;
    private BigDecimal tax;
    private BigDecimal netSalary;
    private String payslipPdfPath;
    private LocalDateTime generatedAt;
}
