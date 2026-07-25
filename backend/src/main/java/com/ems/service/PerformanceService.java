package com.ems.service;

import com.ems.dto.PerformanceReviewDTO;

import java.util.List;

public interface PerformanceService {
    PerformanceReviewDTO createReview(PerformanceReviewDTO dto);
    List<PerformanceReviewDTO> getEmployeeReviews(Long employeeId);
    List<PerformanceReviewDTO> getReviewsByReviewer(Long reviewerId);
}
