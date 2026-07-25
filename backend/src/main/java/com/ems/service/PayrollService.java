package com.ems.service;

import com.ems.dto.PayrollDTO;

import java.math.BigDecimal;
import java.util.List;

public interface PayrollService {
    PayrollDTO generatePayroll(Long employeeId, String month, BigDecimal bonus, BigDecimal deductions);
    PayrollDTO getPayrollById(Long id);
    List<PayrollDTO> getEmployeePayrolls(Long employeeId);
    List<PayrollDTO> getAllPayrolls();
    byte[] getPayslipPdf(Long payrollId);
}
