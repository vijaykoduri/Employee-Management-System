package com.ems.service;

import com.ems.entity.Employee;
import com.ems.entity.Notification;

import java.util.List;

public interface NotificationService {
    void sendNotification(Employee employee, String message);
    void sendBroadcastNotification(String message);
    List<Notification> getMyNotifications(Long employeeId);
    List<Notification> getUnreadNotifications(Long employeeId);
    void markAsRead(Long notificationId);
}
