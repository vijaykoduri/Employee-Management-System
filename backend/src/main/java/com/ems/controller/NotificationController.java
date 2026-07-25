package com.ems.controller;

import com.ems.entity.Notification;
import com.ems.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Notification>> getMyNotifications(@PathVariable Long employeeId) {
        return ResponseEntity.ok(notificationService.getMyNotifications(employeeId));
    }

    @GetMapping("/employee/{employeeId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable Long employeeId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(employeeId));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<String> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok("Notification marked as read.");
    }
}
