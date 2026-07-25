package com.ems.controller;

import com.ems.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    // --- EMPLOYEES ---
    @GetMapping("/employees/excel")
    public ResponseEntity<byte[]> getEmployeesExcel() throws IOException {
        byte[] data = reportService.generateEmployeesExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"employees_report.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/employees/pdf")
    public ResponseEntity<byte[]> getEmployeesPdf() {
        byte[] data = reportService.generateEmployeesPdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"employees_report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }

    // --- ATTENDANCE ---
    @GetMapping("/attendance/excel")
    public ResponseEntity<byte[]> getAttendanceExcel() throws IOException {
        byte[] data = reportService.generateAttendanceExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"attendance_report.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/attendance/pdf")
    public ResponseEntity<byte[]> getAttendancePdf() {
        byte[] data = reportService.generateAttendancePdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"attendance_report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }

    // --- SALARY ---
    @GetMapping("/salary/excel")
    public ResponseEntity<byte[]> getSalaryExcel() throws IOException {
        byte[] data = reportService.generateSalaryExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"salary_report.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/salary/pdf")
    public ResponseEntity<byte[]> getSalaryPdf() {
        byte[] data = reportService.generateSalaryPdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"salary_report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }

    // --- DEPARTMENTS ---
    @GetMapping("/departments/excel")
    public ResponseEntity<byte[]> getDepartmentsExcel() throws IOException {
        byte[] data = reportService.generateDepartmentExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"department_report.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/departments/pdf")
    public ResponseEntity<byte[]> getDepartmentsPdf() {
        byte[] data = reportService.generateDepartmentPdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"department_report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }

    // --- PERFORMANCE ---
    @GetMapping("/performance/excel")
    public ResponseEntity<byte[]> getPerformanceExcel() throws IOException {
        byte[] data = reportService.generatePerformanceExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"performance_report.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/performance/pdf")
    public ResponseEntity<byte[]> getPerformancePdf() {
        byte[] data = reportService.generatePerformancePdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"performance_report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }

    // --- LEAVES ---
    @GetMapping("/leaves/excel")
    public ResponseEntity<byte[]> getLeavesExcel() throws IOException {
        byte[] data = reportService.generateLeaveExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"leaves_report.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/leaves/pdf")
    public ResponseEntity<byte[]> getLeavesPdf() {
        byte[] data = reportService.generateLeavePdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"leaves_report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }
}
