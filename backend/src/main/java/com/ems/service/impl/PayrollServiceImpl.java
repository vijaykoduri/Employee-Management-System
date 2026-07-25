package com.ems.service.impl;

import com.ems.dto.PayrollDTO;
import com.ems.entity.Employee;
import com.ems.entity.Payroll;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.PayrollRepository;
import com.ems.service.PayrollService;
import com.ems.service.AuditLogService;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PayrollServiceImpl implements PayrollService {

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    public PayrollDTO generatePayroll(Long employeeId, String month, BigDecimal bonus, BigDecimal deductions) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));

        if (payrollRepository.existsByEmployeeIdAndMonth(employeeId, month)) {
            throw new BadRequestException("Payroll already generated for employee in " + month);
        }

        BigDecimal base = employee.getBaseSalary() != null ? employee.getBaseSalary() : new BigDecimal("30000");
        BigDecimal bon = bonus != null ? bonus : BigDecimal.ZERO;
        BigDecimal ded = deductions != null ? deductions : BigDecimal.ZERO;

        // Calculate 12% Tax
        BigDecimal gross = base.add(bon);
        BigDecimal tax = gross.multiply(new BigDecimal("0.12"));
        BigDecimal net = gross.subtract(ded).subtract(tax);

        Payroll payroll = Payroll.builder()
                .employee(employee)
                .month(month)
                .baseSalary(base)
                .bonus(bon)
                .deductions(ded)
                .tax(tax)
                .netSalary(net)
                .generatedAt(LocalDateTime.now())
                .build();

        Payroll saved = payrollRepository.save(payroll);
        auditLogService.log("SYSTEM", "GENERATE_PAYROLL", "Generated payroll for " + employee.getUsername() + " - " + month);
        return convertToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PayrollDTO getPayrollById(Long id) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll record not found."));
        return convertToDTO(payroll);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PayrollDTO> getEmployeePayrolls(Long employeeId) {
        return payrollRepository.findByEmployeeId(employeeId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PayrollDTO> getAllPayrolls() {
        return payrollRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] getPayslipPdf(Long payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll record not found."));

        Employee employee = payroll.getEmployee();

        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font mainTitleFont = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(59, 130, 246));
            Font sectionTitleFont = new Font(Font.HELVETICA, 14, Font.BOLD, Color.DARK_GRAY);
            Font textFont = new Font(Font.HELVETICA, 11, Font.NORMAL, Color.BLACK);
            Font boldTextFont = new Font(Font.HELVETICA, 11, Font.BOLD, Color.BLACK);

            // Title
            Paragraph title = new Paragraph("EMPLOYEE PAYSLIP", mainTitleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20f);
            document.add(title);

            // Metainfo
            Paragraph meta = new Paragraph("Payslip Month: " + payroll.getMonth() + "\nGenerated on: " + payroll.getGeneratedAt().toLocalDate() + "\n\n", textFont);
            document.add(meta);

            // Employee details table
            PdfPTable empTable = new PdfPTable(2);
            empTable.setWidthPercentage(100);
            empTable.setSpacingAfter(20f);

            empTable.addCell(new PdfPCell(new Phrase("Employee Name: " + employee.getFullName(), textFont)));
            empTable.addCell(new PdfPCell(new Phrase("Employee ID: " + employee.getId(), textFont)));
            empTable.addCell(new PdfPCell(new Phrase("Designation: " + (employee.getDesignation() != null ? employee.getDesignation() : "Staff"), textFont)));
            empTable.addCell(new PdfPCell(new Phrase("Department: " + (employee.getDepartment() != null ? employee.getDepartment().getName() : "General"), textFont)));

            document.add(empTable);

            // Divider
            Paragraph divider = new Paragraph("Salary Breakdown", sectionTitleFont);
            divider.setSpacingAfter(10f);
            document.add(divider);

            // Financial breakdown table
            PdfPTable finTable = new PdfPTable(2);
            finTable.setWidthPercentage(100);
            finTable.setSpacingAfter(30f);

            finTable.addCell(new PdfPCell(new Phrase("Description", boldTextFont)));
            finTable.addCell(new PdfPCell(new Phrase("Amount ($)", boldTextFont)));

            finTable.addCell(new PdfPCell(new Phrase("Base Salary", textFont)));
            finTable.addCell(new PdfPCell(new Phrase(payroll.getBaseSalary().toString(), textFont)));

            finTable.addCell(new PdfPCell(new Phrase("Allowances / Bonus", textFont)));
            finTable.addCell(new PdfPCell(new Phrase(payroll.getBonus().toString(), textFont)));

            finTable.addCell(new PdfPCell(new Phrase("Deductions", textFont)));
            finTable.addCell(new PdfPCell(new Phrase(payroll.getDeductions().toString(), textFont)));

            finTable.addCell(new PdfPCell(new Phrase("Income Tax (12%)", textFont)));
            finTable.addCell(new PdfPCell(new Phrase(payroll.getTax().toString(), textFont)));

            PdfPCell netLabel = new PdfPCell(new Phrase("Net Salary", boldTextFont));
            netLabel.setBackgroundColor(new Color(243, 244, 246));
            finTable.addCell(netLabel);

            PdfPCell netVal = new PdfPCell(new Phrase(payroll.getNetSalary().toString(), boldTextFont));
            netVal.setBackgroundColor(new Color(243, 244, 246));
            finTable.addCell(netVal);

            document.add(finTable);

            // Footer
            Paragraph footer = new Paragraph("This is an electronically generated document. No signature required.", new Font(Font.HELVETICA, 9, Font.ITALIC, Color.GRAY));
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (DocumentException ex) {
            throw new BadRequestException("PDF generation failed: " + ex.getMessage());
        }

        return out.toByteArray();
    }

    private PayrollDTO convertToDTO(Payroll p) {
        if (p == null) return null;
        return PayrollDTO.builder()
                .id(p.getId())
                .employeeId(p.getEmployee().getId())
                .employeeName(p.getEmployee().getFullName())
                .month(p.getMonth())
                .baseSalary(p.getBaseSalary())
                .bonus(p.getBonus())
                .deductions(p.getDeductions())
                .tax(p.getTax())
                .netSalary(p.getNetSalary())
                .payslipPdfPath(p.getPayslipPdfPath())
                .generatedAt(p.getGeneratedAt())
                .build();
    }
}
