package com.ems.repository;

import com.ems.entity.Project;
import com.ems.entity.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    Optional<Project> findByName(String name);

    List<Project> findByEmployeesId(Long employeeId);

    long countByStatus(ProjectStatus status);

    @Query("SELECT p FROM Project p JOIN p.employees e WHERE e.department.id = :deptId")
    List<Project> findByDepartmentId(@Param("deptId") Long deptId);
}
