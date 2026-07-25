package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementDTO {
    private Long id;
    private String title;
    private String content;
    private Long createdById;
    private String createdByFullName;
    private LocalDateTime createdAt;
}
