package com.ems.repository;

import com.ems.entity.LeaveRequest;
import com.ems.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployeeId(Long employeeId);

    List<LeaveRequest> findByStatus(LeaveStatus status);

    long countByStatus(LeaveStatus status);

    @Query("SELECT lr FROM LeaveRequest lr JOIN lr.employee e WHERE e.department.id = :deptId")
    List<LeaveRequest> findByDepartmentId(@Param("deptId") Long deptId);

    @Query("SELECT lr FROM LeaveRequest lr JOIN lr.employee e WHERE e.manager.id = :managerId")
    List<LeaveRequest> findByManagerId(@Param("managerId") Long managerId);

    @Query("SELECT COUNT(lr) FROM LeaveRequest lr WHERE lr.status = :status")
    long countPendingLeaves(@Param("status") LeaveStatus status);
}
