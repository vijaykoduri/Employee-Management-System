package com.ems.controller;

import com.ems.dto.LeaveRequestDTO;
import com.ems.entity.LeaveStatus;
import com.ems.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @PostMapping("/apply")
    public ResponseEntity<LeaveRequestDTO> applyLeave(@Valid @RequestBody LeaveRequestDTO dto) {
        return ResponseEntity.ok(leaveService.applyLeave(dto));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<LeaveRequestDTO> reviewLeave(
            @PathVariable Long id,
            @RequestParam LeaveStatus status,
            @RequestParam(required = false, defaultValue = "") String remarks,
            @RequestParam Long reviewerId) {
        return ResponseEntity.ok(leaveService.reviewLeave(id, status, remarks, reviewerId));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveRequestDTO>> getEmployeeLeaves(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveService.getEmployeeLeaves(employeeId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<LeaveRequestDTO>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingLeaves());
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<LeaveRequestDTO>> getDepartmentLeaves(@PathVariable Long departmentId) {
        return ResponseEntity.ok(leaveService.getDepartmentLeaves(departmentId));
    }

    @GetMapping("/manager/{managerId}")
    public ResponseEntity<List<LeaveRequestDTO>> getManagerLeaves(@PathVariable Long managerId) {
        return ResponseEntity.ok(leaveService.getManagerLeaves(managerId));
    }

    @GetMapping("/balance/{employeeId}")
    public ResponseEntity<Long> getLeaveBalance(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveService.getLeaveBalance(employeeId));
    }
}
