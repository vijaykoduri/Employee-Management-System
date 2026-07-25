package com.ems.service;

import com.ems.dto.LeaveRequestDTO;
import com.ems.entity.LeaveStatus;

import java.util.List;

public interface LeaveService {
    LeaveRequestDTO applyLeave(LeaveRequestDTO dto);
    LeaveRequestDTO reviewLeave(Long leaveId, LeaveStatus status, String remarks, Long reviewerId);
    List<LeaveRequestDTO> getEmployeeLeaves(Long employeeId);
    List<LeaveRequestDTO> getPendingLeaves();
    List<LeaveRequestDTO> getDepartmentLeaves(Long departmentId);
    List<LeaveRequestDTO> getManagerLeaves(Long managerId);
    long getLeaveBalance(Long employeeId);
}
