package com.ems.service.impl;

import com.ems.dto.AttendanceDTO;
import com.ems.entity.Attendance;
import com.ems.entity.AttendanceStatus;
import com.ems.entity.Employee;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.AttendanceRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.service.AttendanceService;
import com.ems.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AuditLogService auditLogService;

    private static final LocalTime SHIFT_START = LocalTime.of(9, 0);
    private static final LocalTime SHIFT_END = LocalTime.of(17, 0);

    @Override
    public AttendanceDTO checkIn(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));

        LocalDate today = LocalDate.now();
        Optional<Attendance> existing = attendanceRepository.findByEmployeeIdAndDate(employeeId, today);

        LocalDateTime now = LocalDateTime.now();
        LocalTime time = now.toLocalTime();

        AttendanceStatus status = AttendanceStatus.PRESENT;
        int lateMinutes = 0;

        if (time.isAfter(SHIFT_START.plus(5, ChronoUnit.MINUTES))) {
            status = AttendanceStatus.LATE;
            lateMinutes = (int) ChronoUnit.MINUTES.between(SHIFT_START, time);
        }

        Attendance attendance;
        if (existing.isPresent()) {
            attendance = existing.get();
            if (attendance.getCheckOutTime() != null) {
                // Re-check-in: reset the checkout time and update check-in details
                attendance.setCheckInTime(now);
                attendance.setCheckOutTime(null);
                attendance.setStatus(status);
                attendance.setLateMinutes(lateMinutes);
                attendance.setOvertimeMinutes(0);
            } else {
                throw new BadRequestException("Already checked in today.");
            }
        } else {
            attendance = Attendance.builder()
                    .employee(employee)
                    .date(today)
                    .checkInTime(now)
                    .status(status)
                    .lateMinutes(lateMinutes)
                    .overtimeMinutes(0)
                    .build();
        }

        Attendance saved = attendanceRepository.save(attendance);
        auditLogService.log(employee.getUsername(), "CHECK_IN", "Checked in at " + time);
        return convertToDTO(saved);
    }

    @Override
    public AttendanceDTO checkOut(Long employeeId) {
        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new BadRequestException("You must check in first before checking out."));

        if (attendance.getCheckOutTime() != null) {
            throw new BadRequestException("Already checked out today.");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalTime time = now.toLocalTime();

        int overtimeMinutes = 0;
        if (time.isAfter(SHIFT_END)) {
            overtimeMinutes = (int) ChronoUnit.MINUTES.between(SHIFT_END, time);
        }

        attendance.setCheckOutTime(now);
        attendance.setOvertimeMinutes(overtimeMinutes);

        Attendance saved = attendanceRepository.save(attendance);
        auditLogService.log(attendance.getEmployee().getUsername(), "CHECK_OUT", "Checked out at " + time + " (Overtime: " + overtimeMinutes + " min)");
        return convertToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceDTO getTodayAttendance(Long employeeId) {
        return attendanceRepository.findByEmployeeIdAndDate(employeeId, LocalDate.now())
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDTO> getMonthlyAttendance(Long employeeId, String yearMonth) {
        YearMonth ym = YearMonth.parse(yearMonth);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        return attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, start, end).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAllTodayAttendance() {
        return attendanceRepository.findByDate(LocalDate.now()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDTO> getDepartmentTodayAttendance(Long departmentId) {
        return attendanceRepository.findByDepartmentIdAndDate(departmentId, LocalDate.now()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getLateCount(Long employeeId) {
        return attendanceRepository.countByEmployeeIdAndStatus(employeeId, AttendanceStatus.LATE);
    }

    private AttendanceDTO convertToDTO(Attendance attendance) {
        if (attendance == null) return null;
        return AttendanceDTO.builder()
                .id(attendance.getId())
                .employeeId(attendance.getEmployee().getId())
                .employeeName(attendance.getEmployee().getFullName())
                .date(attendance.getDate())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(attendance.getCheckOutTime())
                .status(attendance.getStatus())
                .lateMinutes(attendance.getLateMinutes())
                .overtimeMinutes(attendance.getOvertimeMinutes())
                .build();
    }
}
