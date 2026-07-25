package com.ems.repository;

import com.ems.entity.Attendance;
import com.ems.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);

    List<Attendance> findByEmployeeIdAndDateBetween(Long employeeId, LocalDate startDate, LocalDate endDate);

    List<Attendance> findByDate(LocalDate date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date AND a.status = :status")
    long countByDateAndStatus(@Param("date") LocalDate date, @Param("status") AttendanceStatus status);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.employee.id = :employeeId AND a.status = :status")
    long countByEmployeeIdAndStatus(@Param("employeeId") Long employeeId, @Param("status") AttendanceStatus status);

    List<Attendance> findByEmployeeId(Long employeeId);

    @Query("SELECT a FROM Attendance a JOIN a.employee e WHERE e.department.id = :deptId AND a.date = :date")
    List<Attendance> findByDepartmentIdAndDate(@Param("deptId") Long deptId, @Param("date") LocalDate date);
}
