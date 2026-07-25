package com.ems.service.impl;

import com.ems.dto.LeaveRequestDTO;
import com.ems.entity.Employee;
import com.ems.entity.LeaveRequest;
import com.ems.entity.LeaveStatus;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LeaveRequestRepository;
import com.ems.service.AuditLogService;
import com.ems.service.LeaveService;
import com.ems.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class LeaveServiceImpl implements LeaveService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    private static final long ANNUAL_LEAVE_LIMIT = 30;

    @Override
    public LeaveRequestDTO applyLeave(LeaveRequestDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));

        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new BadRequestException("Start date cannot be after end date.");
        }

        long daysRequested = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate()) + 1;
        long currentBalance = getLeaveBalance(dto.getEmployeeId());

        if (daysRequested > currentBalance) {
            throw new BadRequestException("Insufficient leave balance. Requested: " + daysRequested + ", Remaining: " + currentBalance);
        }

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employee(employee)
                .leaveType(dto.getLeaveType())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .status(LeaveStatus.PENDING)
                .reason(dto.getReason())
                .build();

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        auditLogService.log(employee.getUsername(), "APPLY_LEAVE", "Applied for leave of " + daysRequested + " days");

        // Notify Supervisor
        if (employee.getManager() != null) {
            notificationService.sendNotification(employee.getManager(),
                    "Leave Request filed by " + employee.getFullName() + " for " + daysRequested + " days.");
        }

        return convertToDTO(saved);
    }

    @Override
    public LeaveRequestDTO reviewLeave(Long leaveId, LeaveStatus status, String remarks, Long reviewerId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found."));

        Employee reviewer = employeeRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found."));

        leaveRequest.setStatus(status);
        leaveRequest.setRemarks(remarks);
        leaveRequest.setReviewedBy(reviewer);

        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);
        auditLogService.log(reviewer.getUsername(), "REVIEW_LEAVE", "Leave status updated to " + status + " for Request ID " + leaveId);

        // Notify Employee
        notificationService.sendNotification(leaveRequest.getEmployee(),
                "Your leave request from " + leaveRequest.getStartDate() + " to " + leaveRequest.getEndDate() + " has been " + status + ".");

        return convertToDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestDTO> getEmployeeLeaves(Long employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestDTO> getPendingLeaves() {
        return leaveRequestRepository.findByStatus(LeaveStatus.PENDING).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestDTO> getDepartmentLeaves(Long departmentId) {
        return leaveRequestRepository.findByDepartmentId(departmentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestDTO> getManagerLeaves(Long managerId) {
        return leaveRequestRepository.findByManagerId(managerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getLeaveBalance(Long employeeId) {
        List<LeaveRequest> approvedLeaves = leaveRequestRepository.findByEmployeeId(employeeId).stream()
                .filter(l -> l.getStatus() == LeaveStatus.APPROVED)
                .toList();

        long daysUsed = 0;
        for (LeaveRequest leave : approvedLeaves) {
            daysUsed += ChronoUnit.DAYS.between(leave.getStartDate(), leave.getEndDate()) + 1;
        }

        return ANNUAL_LEAVE_LIMIT - daysUsed;
    }

    private LeaveRequestDTO convertToDTO(LeaveRequest request) {
        if (request == null) return null;
        return LeaveRequestDTO.builder()
                .id(request.getId())
                .employeeId(request.getEmployee().getId())
                .employeeName(request.getEmployee().getFullName())
                .leaveType(request.getLeaveType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus())
                .reason(request.getReason())
                .reviewedById(request.getReviewedBy() != null ? request.getReviewedBy().getId() : null)
                .reviewedByName(request.getReviewedBy() != null ? request.getReviewedBy().getFullName() : null)
                .remarks(request.getRemarks())
                .build();
    }
}
