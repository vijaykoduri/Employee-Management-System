package com.ems.controller;

import com.ems.dto.PerformanceReviewDTO;
import com.ems.service.PerformanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/performance")
public class PerformanceController {

    @Autowired
    private PerformanceService performanceService;

    @PostMapping
    public ResponseEntity<PerformanceReviewDTO> createReview(@Valid @RequestBody PerformanceReviewDTO dto) {
        return ResponseEntity.ok(performanceService.createReview(dto));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PerformanceReviewDTO>> getEmployeeReviews(@PathVariable Long employeeId) {
        return ResponseEntity.ok(performanceService.getEmployeeReviews(employeeId));
    }

    @GetMapping("/reviewer/{reviewerId}")
    public ResponseEntity<List<PerformanceReviewDTO>> getReviewsByReviewer(@PathVariable Long reviewerId) {
        return ResponseEntity.ok(performanceService.getReviewsByReviewer(reviewerId));
    }
}
