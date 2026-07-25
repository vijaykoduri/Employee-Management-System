package com.ems.dto;

import com.ems.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String accessToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private Role role;
    private String username;
    private String email;
    private String fullName;
    private Long userId;
    private boolean twoFactorRequired;
}
