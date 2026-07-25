package com.ems.service.impl;

import com.ems.entity.AuditLog;
import com.ems.repository.AuditLogRepository;
import com.ems.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AuditLogServiceImpl implements AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Override
    public void log(String username, String action, String details) {
        AuditLog log = AuditLog.builder()
                .username(username)
                .action(action)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
        auditLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
