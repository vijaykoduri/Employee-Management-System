package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceReviewDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Long reviewerId;
    private String reviewerName;
    private LocalDate reviewDate;
    private Integer rating;
    private String feedback;
    private String kpiGoals;
}
