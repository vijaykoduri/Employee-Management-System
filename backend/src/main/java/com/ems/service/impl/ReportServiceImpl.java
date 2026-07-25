package com.ems.service.impl;

import com.ems.entity.*;
import com.ems.repository.*;
import com.ems.service.ReportService;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PerformanceReviewRepository performanceReviewRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    // --- EMPLOYEES REPORT ---
    @Override
    public byte[] generateEmployeesExcel() throws IOException {
        List<Employee> list = employeeRepository.findAll();
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Employees");
            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Full Name", "Username", "Email", "Role", "Designation", "Department", "Status"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
            }
            int rowIdx = 1;
            for (Employee e : list) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(e.getId());
                row.createCell(1).setCellValue(e.getFullName());
                row.createCell(2).setCellValue(e.getUsername());
                row.createCell(3).setCellValue(e.getEmail());
                row.createCell(4).setCellValue(e.getRole().name());
                row.createCell(5).setCellValue(e.getDesignation() != null ? e.getDesignation() : "");
                row.createCell(6).setCellValue(e.getDepartment() != null ? e.getDepartment().getName() : "N/A");
                row.createCell(7).setCellValue(e.getStatus().name());
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    @Override
    public byte[] generateEmployeesPdf() {
        List<Employee> list = employeeRepository.findAll();
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Paragraph title = new Paragraph("Employees Report", new Font(Font.HELVETICA, 18, Font.BOLD, Color.BLUE));
            title.setSpacingAfter(15f);
            document.add(title);

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.addCell(new PdfPCell(new Phrase("ID", new Font(Font.HELVETICA, 11, Font.BOLD))));
            table.addCell(new PdfPCell(new Phrase("Name", new Font(Font.HELVETICA, 11, Font.BOLD))));
            table.addCell(new PdfPCell(new Phrase("Email", new Font(Font.HELVETICA, 11, Font.BOLD))));
            table.addCell(new PdfPCell(new Phrase("Role", new Font(Font.HELVETICA, 11, Font.BOLD))));
            table.addCell(new PdfPCell(new Phrase("Designation", new Font(Font.HELVETICA, 11, Font.BOLD))));
            table.addCell(new PdfPCell(new Phrase("Department", new Font(Font.HELVETICA, 11, Font.BOLD))));
            table.addCell(new PdfPCell(new Phrase("Status", new Font(Font.HELVETICA, 11, Font.BOLD))));

            for (Employee e : list) {
                table.addCell(String.valueOf(e.getId()));
                table.addCell(e.getFullName());
                table.addCell(e.getEmail());
                table.addCell(e.getRole().name());
                table.addCell(e.getDesignation() != null ? e.getDesignation() : "");
                table.addCell(e.getDepartment() != null ? e.getDepartment().getName() : "N/A");
                table.addCell(e.getStatus().name());
            }
            document.add(table);
            document.close();
        } catch (DocumentException ex) {
            ex.printStackTrace();
        }
        return out.toByteArray();
    }

    // --- ATTENDANCE REPORT ---
    @Override
    public byte[] generateAttendanceExcel() throws IOException {
        List<Attendance> list = attendanceRepository.findAll();
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Attendance");
            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Employee Name", "Date", "Check In", "Check Out", "Status", "Late (Min)", "Overtime (Min)"};
            for (int i = 0; i < columns.length; i++) {
                headerRow.createCell(i).setCellValue(columns[i]);
            }
            int rowIdx = 1;
            for (Attendance a : list) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(a.getId());
                row.createCell(1).setCellValue(a.getEmployee().getFullName());
                row.createCell(2).setCellValue(a.getDate().toString());
                row.createCell(3).setCellValue(a.getCheckInTime() != null ? a.getCheckInTime().toString() : "");
                row.createCell(4).setCellValue(a.getCheckOutTime() != null ? a.getCheckOutTime().toString() : "");
                row.createCell(5).setCellValue(a.getStatus().name());
                row.createCell(6).setCellValue(a.getLateMinutes() != null ? a.getLateMinutes() : 0);
                row.createCell(7).setCellValue(a.getOvertimeMinutes() != null ? a.getOvertimeMinutes() : 0);
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    @Override
    public byte[] generateAttendancePdf() {
        List<Attendance> list = attendanceRepository.findAll();
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Paragraph title = new Paragraph("Attendance Report", new Font(Font.HELVETICA, 18, Font.BOLD, Color.BLUE));
            title.setSpacingAfter(15f);
            document.add(title);

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.addCell("Employee");
            table.addCell("Date");
            table.addCell("Check In");
            table.addCell("Check Out");
            table.addCell("Status");
            table.addCell("Late (Min)");
            table.addCell("Overtime (Min)");

            for (Attendance a : list) {
                table.addCell(a.getEmployee().getFullName());
                table.addCell(a.getDate().toString());
                table.addCell(a.getCheckInTime() != null ? a.getCheckInTime().toLocalTime().toString() : "-");
                table.addCell(a.getCheckOutTime() != null ? a.getCheckOutTime().toLocalTime().toString() : "-");
                table.addCell(a.getStatus().name());
                table.addCell(String.valueOf(a.getLateMinutes()));
                table.addCell(String.valueOf(a.getOvertimeMinutes()));
            }
            document.add(table);
            document.close();
        } catch (DocumentException ex) {
            ex.printStackTrace();
        }
        return out.toByteArray();
    }

    // --- SALARY / PAYROLL REPORT ---
    @Override
    public byte[] generateSalaryExcel() throws IOException {
        List<Payroll> list = payrollRepository.findAll();
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Salary Report");
            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Employee Name", "Month", "Base Salary", "Bonus", "Deductions", "Tax", "Net Salary", "Generated At"};
            for (int i = 0; i < columns.length; i++) {
                headerRow.createCell(i).setCellValue(columns[i]);
            }
            int rowIdx = 1;
            for (Payroll p : list) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(p.getId());
                row.createCell(1).setCellValue(p.getEmployee().getFullName());
                row.createCell(2).setCellValue(p.getMonth());
                row.createCell(3).setCellValue(p.getBaseSalary().doubleValue());
                row.createCell(4).setCellValue(p.getBonus().doubleValue());
                row.createCell(5).setCellValue(p.getDeductions().doubleValue());
                row.createCell(6).setCellValue(p.getTax().doubleValue());
                row.createCell(7).setCellValue(p.getNetSalary().doubleValue());
                row.createCell(8).setCellValue(p.getGeneratedAt().toString());
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    @Override
    public byte[] generateSalaryPdf() {
        List<Payroll> list = payrollRepository.findAll();
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Paragraph title = new Paragraph("Salary Report", new Font(Font.HELVETICA, 18, Font.BOLD, Color.BLUE));
            title.setSpacingAfter(15f);
            document.add(title);

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.addCell("Employee");
            table.addCell("Month");
            table.addCell("Base Salary");
            table.addCell("Bonus");
            table.addCell("Deductions");
            table.addCell("Tax");
            table.addCell("Net Salary");

            for (Payroll p : list) {
                table.addCell(p.getEmployee().getFullName());
                table.addCell(p.getMonth());
                table.addCell(p.getBaseSalary().toString());
                table.addCell(p.getBonus().toString());
                table.addCell(p.getDeductions().toString());
                table.addCell(p.getTax().toString());
                table.addCell(p.getNetSalary().toString());
            }
            document.add(table);
            document.close();
        } catch (DocumentException ex) {
            ex.printStackTrace();
        }
        return out.toByteArray();
    }

    // --- DEPARTMENT REPORT ---
    @Override
    public byte[] generateDepartmentExcel() throws IOException {
        List<Department> list = departmentRepository.findAll();
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Departments");
            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Department Name", "Description", "Manager Name", "Employee Count"};
            for (int i = 0; i < columns.length; i++) {
                headerRow.createCell(i).setCellValue(columns[i]);
            }
            int rowIdx = 1;
            for (Department d : list) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(d.getId());
                row.createCell(1).setCellValue(d.getName());
                row.createCell(2).setCellValue(d.getDescription() != null ? d.getDescription() : "");
                row.createCell(3).setCellValue(d.getManager() != null ? d.getManager().getFullName() : "Unassigned");
                long empCount = employeeRepository.findByDepartmentId(d.getId()).size();
                row.createCell(4).setCellValue(empCount);
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    @Override
    public byte[] generateDepartmentPdf() {
        List<Department> list = departmentRepository.findAll();
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Paragraph title = new Paragraph("Department Report", new Font(Font.HELVETICA, 18, Font.BOLD, Color.BLUE));
            title.setSpacingAfter(15f);
            document.add(title);

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.addCell("ID");
            table.addCell("Department Name");
            table.addCell("Manager");
            table.addCell("Employee Count");

            for (Department d : list) {
                table.addCell(String.valueOf(d.getId()));
                table.addCell(d.getName());
                table.addCell(d.getManager() != null ? d.getManager().getFullName() : "Unassigned");
                long empCount = employeeRepository.findByDepartmentId(d.getId()).size();
                table.addCell(String.valueOf(empCount));
            }
            document.add(table);
            document.close();
        } catch (DocumentException ex) {
            ex.printStackTrace();
        }
        return out.toByteArray();
    }

    // --- PERFORMANCE REPORT ---
    @Override
    public byte[] generatePerformanceExcel() throws IOException {
        List<PerformanceReview> list = performanceReviewRepository.findAll();
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Performance Reviews");
            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Employee Name", "Reviewer Name", "Review Date", "Rating (1-5)", "Feedback", "KPI Goals"};
            for (int i = 0; i < columns.length; i++) {
                headerRow.createCell(i).setCellValue(columns[i]);
            }
            int rowIdx = 1;
            for (PerformanceReview r : list) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(r.getId());
                row.createCell(1).setCellValue(r.getEmployee().getFullName());
                row.createCell(2).setCellValue(r.getReviewer().getFullName());
                row.createCell(3).setCellValue(r.getReviewDate().toString());
                row.createCell(4).setCellValue(r.getRating());
                row.createCell(5).setCellValue(r.getFeedback());
                row.createCell(6).setCellValue(r.getKpiGoals());
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    @Override
    public byte[] generatePerformancePdf() {
        List<PerformanceReview> list = performanceReviewRepository.findAll();
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Paragraph title = new Paragraph("Performance Report", new Font(Font.HELVETICA, 18, Font.BOLD, Color.BLUE));
            title.setSpacingAfter(15f);
            document.add(title);

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.addCell("Employee");
            table.addCell("Reviewer");
            table.addCell("Date");
            table.addCell("Rating");
            table.addCell("Feedback");
            table.addCell("KPI Goals");

            for (PerformanceReview r : list) {
                table.addCell(r.getEmployee().getFullName());
                table.addCell(r.getReviewer().getFullName());
                table.addCell(r.getReviewDate().toString());
                table.addCell(String.valueOf(r.getRating()) + "/5");
                table.addCell(r.getFeedback());
                table.addCell(r.getKpiGoals());
            }
            document.add(table);
            document.close();
        } catch (DocumentException ex) {
            ex.printStackTrace();
        }
        return out.toByteArray();
    }

    // --- LEAVE REPORT ---
    @Override
    public byte[] generateLeaveExcel() throws IOException {
        List<LeaveRequest> list = leaveRequestRepository.findAll();
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Leaves");
            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Employee Name", "Leave Type", "Start Date", "End Date", "Status", "Reason", "Reviewed By"};
            for (int i = 0; i < columns.length; i++) {
                headerRow.createCell(i).setCellValue(columns[i]);
            }
            int rowIdx = 1;
            for (LeaveRequest lr : list) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(lr.getId());
                row.createCell(1).setCellValue(lr.getEmployee().getFullName());
                row.createCell(2).setCellValue(lr.getLeaveType().name());
                row.createCell(3).setCellValue(lr.getStartDate().toString());
                row.createCell(4).setCellValue(lr.getEndDate().toString());
                row.createCell(5).setCellValue(lr.getStatus().name());
                row.createCell(6).setCellValue(lr.getReason());
                row.createCell(7).setCellValue(lr.getReviewedBy() != null ? lr.getReviewedBy().getFullName() : "Unreviewed");
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    @Override
    public byte[] generateLeavePdf() {
        List<LeaveRequest> list = leaveRequestRepository.findAll();
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Paragraph title = new Paragraph("Leave Management Report", new Font(Font.HELVETICA, 18, Font.BOLD, Color.BLUE));
            title.setSpacingAfter(15f);
            document.add(title);

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.addCell("Employee");
            table.addCell("Type");
            table.addCell("Start Date");
            table.addCell("End Date");
            table.addCell("Status");
            table.addCell("Reason");
            table.addCell("Reviewed By");

            for (LeaveRequest lr : list) {
                table.addCell(lr.getEmployee().getFullName());
                table.addCell(lr.getLeaveType().name());
                table.addCell(lr.getStartDate().toString());
                table.addCell(lr.getEndDate().toString());
                table.addCell(lr.getStatus().name());
                table.addCell(lr.getReason());
                table.addCell(lr.getReviewedBy() != null ? lr.getReviewedBy().getFullName() : "-");
            }
            document.add(table);
            document.close();
        } catch (DocumentException ex) {
            ex.printStackTrace();
        }
        return out.toByteArray();
    }
}
