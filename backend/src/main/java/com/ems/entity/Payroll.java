package com.ems.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false, length = 7) // "YYYY-MM"
    private String month;

    @Column(name = "base_salary", nullable = false)
    private BigDecimal baseSalary;

    @Builder.Default
    private BigDecimal bonus = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal deductions = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal tax = BigDecimal.ZERO;

    @Column(name = "net_salary", nullable = false)
    private BigDecimal netSalary;

    @Column(name = "payslip_pdf_path")
    private String payslipPdfPath;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;
}
