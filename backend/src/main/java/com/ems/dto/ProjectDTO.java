package com.ems.dto;

import com.ems.entity.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDate deadline;
    private ProjectStatus status;
    private Set<Long> employeeIds;
    private List<String> employeeNames;
}
