package com.ems.controller;

import com.ems.dto.AttendanceDTO;
import com.ems.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/check-in")
    public ResponseEntity<AttendanceDTO> checkIn(@RequestParam Long employeeId) {
        return ResponseEntity.ok(attendanceService.checkIn(employeeId));
    }

    @PostMapping("/check-out")
    public ResponseEntity<AttendanceDTO> checkOut(@RequestParam Long employeeId) {
        return ResponseEntity.ok(attendanceService.checkOut(employeeId));
    }

    @GetMapping("/today")
    public ResponseEntity<AttendanceDTO> getTodayAttendance(@RequestParam Long employeeId) {
        AttendanceDTO dto = attendanceService.getTodayAttendance(employeeId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<AttendanceDTO>> getMonthlyAttendance(
            @RequestParam Long employeeId,
            @RequestParam String yearMonth) {
        return ResponseEntity.ok(attendanceService.getMonthlyAttendance(employeeId, yearMonth));
    }

    @GetMapping("/all-today")
    public ResponseEntity<List<AttendanceDTO>> getAllTodayAttendance() {
        return ResponseEntity.ok(attendanceService.getAllTodayAttendance());
    }

    @GetMapping("/department-today/{departmentId}")
    public ResponseEntity<List<AttendanceDTO>> getDepartmentTodayAttendance(@PathVariable Long departmentId) {
        return ResponseEntity.ok(attendanceService.getDepartmentTodayAttendance(departmentId));
    }

    @GetMapping("/late-count")
    public ResponseEntity<Long> getLateCount(@RequestParam Long employeeId) {
        return ResponseEntity.ok(attendanceService.getLateCount(employeeId));
    }
}
