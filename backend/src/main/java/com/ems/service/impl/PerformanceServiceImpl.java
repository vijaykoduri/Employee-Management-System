package com.ems.service.impl;

import com.ems.dto.PerformanceReviewDTO;
import com.ems.entity.Employee;
import com.ems.entity.PerformanceReview;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.PerformanceReviewRepository;
import com.ems.service.PerformanceService;
import com.ems.service.AuditLogService;
import com.ems.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PerformanceServiceImpl implements PerformanceService {

    @Autowired
    private PerformanceReviewRepository performanceReviewRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    public PerformanceReviewDTO createReview(PerformanceReviewDTO dto) {
        if (dto.getRating() < 1 || dto.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5.");
        }

        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));

        Employee reviewer = employeeRepository.findById(dto.getReviewerId())
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found."));

        PerformanceReview review = PerformanceReview.builder()
                .employee(employee)
                .reviewer(reviewer)
                .reviewDate(LocalDate.now())
                .rating(dto.getRating())
                .feedback(dto.getFeedback())
                .kpiGoals(dto.getKpiGoals())
                .build();

        PerformanceReview saved = performanceReviewRepository.save(review);
        auditLogService.log(reviewer.getUsername(), "CREATE_PERFORMANCE_REVIEW", "Created performance appraisal for " + employee.getUsername());

        // Notify Employee
        notificationService.sendNotification(employee, "A new performance review has been submitted for you by " + reviewer.getFullName() + ". Rating: " + dto.getRating() + "/5");

        return convertToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PerformanceReviewDTO> getEmployeeReviews(Long employeeId) {
        return performanceReviewRepository.findByEmployeeId(employeeId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PerformanceReviewDTO> getReviewsByReviewer(Long reviewerId) {
        return performanceReviewRepository.findByReviewerId(reviewerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private PerformanceReviewDTO convertToDTO(PerformanceReview r) {
        if (r == null) return null;
        return PerformanceReviewDTO.builder()
                .id(r.getId())
                .employeeId(r.getEmployee().getId())
                .employeeName(r.getEmployee().getFullName())
                .reviewerId(r.getReviewer().getId())
                .reviewerName(r.getReviewer().getFullName())
                .reviewDate(r.getReviewDate())
                .rating(r.getRating())
                .feedback(r.getFeedback())
                .kpiGoals(r.getKpiGoals())
                .build();
    }
}
