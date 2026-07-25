package com.ems.service;

import com.ems.entity.AuditLog;

import java.util.List;

public interface AuditLogService {
    void log(String username, String action, String details);
    List<AuditLog> getAllLogs();
}
