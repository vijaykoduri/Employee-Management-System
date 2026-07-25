package com.ems.service;

import com.ems.dto.AttendanceDTO;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    AttendanceDTO checkIn(Long employeeId);
    AttendanceDTO checkOut(Long employeeId);
    AttendanceDTO getTodayAttendance(Long employeeId);
    List<AttendanceDTO> getMonthlyAttendance(Long employeeId, String yearMonth);
    List<AttendanceDTO> getAllTodayAttendance();
    List<AttendanceDTO> getDepartmentTodayAttendance(Long departmentId);
    long getLateCount(Long employeeId);
}
