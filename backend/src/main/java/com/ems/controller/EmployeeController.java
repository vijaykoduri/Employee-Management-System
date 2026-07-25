package com.ems.controller;

import com.ems.dto.EmployeeDTO;
import com.ems.entity.Role;
import com.ems.entity.Status;
import com.ems.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDTO> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @GetMapping
    public ResponseEntity<Page<EmployeeDTO>> getAllEmployees(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(employeeService.getAllEmployees(searchTerm, role, status, departmentId, pageable));
    }

    @GetMapping("/raw")
    public ResponseEntity<List<EmployeeDTO>> getAllEmployeesRaw() {
        return ResponseEntity.ok(employeeService.getAllEmployeesRaw());
    }

    @PostMapping
    public ResponseEntity<EmployeeDTO> createEmployee(@Valid @RequestBody EmployeeDTO dto) {
        return ResponseEntity.ok(employeeService.createEmployee(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeDTO> updateEmployee(@PathVariable Long id, @Valid @RequestBody EmployeeDTO dto) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok("Employee profile deleted successfully.");
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<EmployeeDTO> updateProfile(@PathVariable Long id, @Valid @RequestBody EmployeeDTO dto) {
        return ResponseEntity.ok(employeeService.updateProfile(id, dto));
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<String> changePassword(
            @PathVariable Long id,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        employeeService.changePassword(id, oldPassword, newPassword);
        return ResponseEntity.ok("Password updated successfully.");
    }

    @PostMapping("/{id}/photo")
    public ResponseEntity<?> uploadPhoto(@PathVariable Long id, @RequestParam("photo") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload.");
        }
        try {
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            String filename = id + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            File dest = new File(dir, filename);
            file.transferTo(dest);

            String photoUrl = "/uploads/" + filename;
            employeeService.updatePhoto(id, photoUrl);
            return ResponseEntity.ok(photoUrl);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to upload image: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/toggle-2fa")
    public ResponseEntity<String> toggle2FA(@PathVariable Long id, @RequestParam boolean enabled) {
        employeeService.toggleTwoFactor(id, enabled);
        return ResponseEntity.ok("Two-factor verification settings updated.");
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<EmployeeDTO>> getEmployeesByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(employeeService.getEmployeesByDepartment(departmentId));
    }

    @GetMapping("/manager/{managerId}")
    public ResponseEntity<List<EmployeeDTO>> getEmployeesByManager(@PathVariable Long managerId) {
        return ResponseEntity.ok(employeeService.getEmployeesByManager(managerId));
    }
}
