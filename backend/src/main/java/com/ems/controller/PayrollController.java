package com.ems.controller;

import com.ems.dto.PayrollDTO;
import com.ems.service.PayrollService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/payroll")
public class PayrollController {

    @Autowired
    private PayrollService payrollService;

    @PostMapping("/generate")
    public ResponseEntity<PayrollDTO> generatePayroll(
            @RequestParam Long employeeId,
            @RequestParam String month,
            @RequestParam(required = false) BigDecimal bonus,
            @RequestParam(required = false) BigDecimal deductions) {
        return ResponseEntity.ok(payrollService.generatePayroll(employeeId, month, bonus, deductions));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PayrollDTO> getPayrollById(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.getPayrollById(id));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PayrollDTO>> getEmployeePayrolls(@PathVariable Long employeeId) {
        return ResponseEntity.ok(payrollService.getEmployeePayrolls(employeeId));
    }

    @GetMapping
    public ResponseEntity<List<PayrollDTO>> getAllPayrolls() {
        return ResponseEntity.ok(payrollService.getAllPayrolls());
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPayslipPdf(@PathVariable Long id) {
        byte[] pdfBytes = payrollService.getPayslipPdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"payslip_" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
