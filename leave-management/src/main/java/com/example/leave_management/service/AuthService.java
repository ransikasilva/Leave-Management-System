package com.example.leave_management.service;

import com.example.leave_management.dto.request.LoginRequest;
import com.example.leave_management.dto.request.UserRegistrationDto;
import com.example.leave_management.dto.response.JwtResponse;

public interface AuthService {
    JwtResponse authenticateUser(LoginRequest loginRequest);

    JwtResponse registerUser(UserRegistrationDto registrationDto);

    boolean validateToken(String token);

    String getUserIdFromToken(String token);

    void logout(String token);

    JwtResponse refreshToken(String refreshToken);

    boolean isTokenBlacklisted(String token);

    void requestPasswordReset(String email);

    boolean validatePasswordResetToken(String token);

    void resetPassword(String token, String newPassword);
}