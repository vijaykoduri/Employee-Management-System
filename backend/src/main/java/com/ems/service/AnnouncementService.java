package com.ems.service;

import com.ems.dto.AnnouncementDTO;

import java.util.List;

public interface AnnouncementService {
    AnnouncementDTO createAnnouncement(AnnouncementDTO dto);
    List<AnnouncementDTO> getAllAnnouncements();
    void deleteAnnouncement(Long id);
}
