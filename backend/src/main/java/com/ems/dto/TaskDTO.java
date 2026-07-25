package com.ems.dto;

import com.ems.entity.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDTO {
    private Long id;
    private Long projectId;
    private String projectName;
    private Long employeeId;
    private String employeeName;
    private String title;
    private String description;
    private LocalDate deadline;
    private TaskStatus status;
}
