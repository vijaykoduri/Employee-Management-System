package com.ems.repository;

import com.ems.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.employee.id = :employeeId OR n.employee IS NULL ORDER BY n.createdAt DESC")
    List<Notification> findByEmployeeIdOrBroadcast(@Param("employeeId") Long employeeId);

    @Query("SELECT n FROM Notification n WHERE (n.employee.id = :employeeId OR n.employee IS NULL) AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByEmployeeIdOrBroadcast(@Param("employeeId") Long employeeId);
}
