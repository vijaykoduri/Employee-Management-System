package com.ems.service.impl;

import com.ems.dto.AnnouncementDTO;
import com.ems.entity.Announcement;
import com.ems.entity.Employee;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.AnnouncementRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.service.AnnouncementService;
import com.ems.service.AuditLogService;
import com.ems.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AnnouncementServiceImpl implements AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    public AnnouncementDTO createAnnouncement(AnnouncementDTO dto) {
        Employee creator = employeeRepository.findById(dto.getCreatedById())
                .orElseThrow(() -> new ResourceNotFoundException("Creator employee not found."));

        Announcement announcement = Announcement.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .createdBy(creator)
                .createdAt(LocalDateTime.now())
                .build();

        Announcement saved = announcementRepository.save(announcement);
        auditLogService.log(creator.getUsername(), "CREATE_ANNOUNCEMENT", "Created announcement: " + saved.getTitle());

        // Broadcast a general notification
        notificationService.sendBroadcastNotification("Announcement: " + saved.getTitle());

        return convertToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementDTO> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteAnnouncement(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found."));
        announcementRepository.delete(announcement);
        auditLogService.log("SYSTEM", "DELETE_ANNOUNCEMENT", "Deleted announcement: " + announcement.getTitle());
    }

    private AnnouncementDTO convertToDTO(Announcement a) {
        if (a == null) return null;
        return AnnouncementDTO.builder()
                .id(a.getId())
                .title(a.getTitle())
                .content(a.getContent())
                .createdById(a.getCreatedBy().getId())
                .createdByFullName(a.getCreatedBy().getFullName())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
