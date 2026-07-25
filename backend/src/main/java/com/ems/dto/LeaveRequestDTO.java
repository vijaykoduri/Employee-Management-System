package com.ems.dto;

import com.ems.entity.LeaveStatus;
import com.ems.entity.LeaveType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequestDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private LeaveStatus status;
    private String reason;
    private Long reviewedById;
    private String reviewedByName;
    private String remarks;
}
