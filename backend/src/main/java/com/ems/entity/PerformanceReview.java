package com.ems.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "performance_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private Employee reviewer;

    @Column(name = "review_date", nullable = false)
    private LocalDate reviewDate;

    @Column(nullable = false)
    private Integer rating; // 1-5 scale

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "kpi_goals", columnDefinition = "TEXT")
    private String kpiGoals;
}
