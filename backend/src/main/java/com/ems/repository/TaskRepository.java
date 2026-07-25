package com.ems.repository;

import com.ems.entity.Task;
import com.ems.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectId(Long projectId);

    List<Task> findByEmployeeId(Long employeeId);

    long countByEmployeeIdAndStatus(Long employeeId, TaskStatus status);
}
