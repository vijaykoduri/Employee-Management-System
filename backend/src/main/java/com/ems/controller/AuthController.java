package com.ems.controller;

import com.ems.dto.LoginRequest;
import com.ems.dto.LoginResponse;
import com.ems.dto.RegisterRequest;
import com.ems.entity.Employee;
import com.ems.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private com.ems.service.DepartmentService departmentService;

    @GetMapping("/departments")
    public ResponseEntity<?> getPublicDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        Employee employee = authService.register(request);
        return ResponseEntity.ok("User registered successfully with ID: " + employee.getId());
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<LoginResponse> verify2FA(@RequestParam String usernameOrEmail, @RequestParam String code) {
        LoginResponse response = authService.verify2FA(usernameOrEmail, code);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        authService.forgotPassword(email);
        return ResponseEntity.ok("If the email exists, a password reset request has been processed.");
    }
}
