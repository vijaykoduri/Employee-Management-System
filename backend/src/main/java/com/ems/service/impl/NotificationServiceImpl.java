package com.ems.service.impl;

import com.ems.entity.Employee;
import com.ems.entity.Notification;
import com.ems.repository.NotificationRepository;
import com.ems.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public void sendNotification(Employee employee, String message) {
        Notification notification = Notification.builder()
                .employee(employee)
                .message(message)
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Override
    public void sendBroadcastNotification(String message) {
        Notification notification = Notification.builder()
                .employee(null) // Null employee represents general broadcast
                .message(message)
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getMyNotifications(Long employeeId) {
        return notificationRepository.findByEmployeeIdOrBroadcast(employeeId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(Long employeeId) {
        return notificationRepository.findUnreadByEmployeeIdOrBroadcast(employeeId);
    }

    @Override
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }
}
