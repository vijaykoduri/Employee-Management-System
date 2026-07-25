package com.ems.service;

import java.io.IOException;

public interface ReportService {
    byte[] generateEmployeesExcel() throws IOException;
    byte[] generateEmployeesPdf();

    byte[] generateAttendanceExcel() throws IOException;
    byte[] generateAttendancePdf();

    byte[] generateSalaryExcel() throws IOException;
    byte[] generateSalaryPdf();

    byte[] generateDepartmentExcel() throws IOException;
    byte[] generateDepartmentPdf();

    byte[] generatePerformanceExcel() throws IOException;
    byte[] generatePerformancePdf();

    byte[] generateLeaveExcel() throws IOException;
    byte[] generateLeavePdf();
}
