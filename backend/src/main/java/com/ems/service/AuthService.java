package com.ems.service;

import com.ems.dto.LoginRequest;
import com.ems.dto.LoginResponse;
import com.ems.dto.RegisterRequest;
import com.ems.entity.Employee;

public interface AuthService {
    Employee register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
    LoginResponse verify2FA(String usernameOrEmail, String code);
    void forgotPassword(String email);
}
