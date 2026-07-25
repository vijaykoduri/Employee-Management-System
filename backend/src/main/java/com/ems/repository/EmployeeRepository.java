package com.ems.repository;

import com.ems.entity.Employee;
import com.ems.entity.Role;
import com.ems.entity.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {

    Optional<Employee> findByUsername(String username);

    Optional<Employee> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    long countByRole(Role role);

    long countByStatus(Status status);

    List<Employee> findByDepartmentId(Long departmentId);

    List<Employee> findByManagerId(Long managerId);

    @Query("SELECT e FROM Employee e WHERE " +
           "(:searchTerm IS NULL OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(e.username) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(e.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(e.designation) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "AND (:role IS NULL OR e.role = :role) " +
           "AND (:status IS NULL OR e.status = :status) " +
           "AND (:departmentId IS NULL OR e.department.id = :departmentId)")
    Page<Employee> searchAndFilter(
            @Param("searchTerm") String searchTerm,
            @Param("role") Role role,
            @Param("status") Status status,
            @Param("departmentId") Long departmentId,
            Pageable pageable);

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.gender = :gender")
    long countByGender(@Param("gender") String gender);
}
