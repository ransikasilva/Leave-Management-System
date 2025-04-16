package com.example.leave_management.controller;

import com.example.leave_management.dto.request.LoginRequest;
import com.example.leave_management.dto.request.PasswordResetDto;
import com.example.leave_management.dto.request.TokenDto;
import com.example.leave_management.dto.request.EmailDto;
import com.example.leave_management.dto.request.UserRegistrationDto;
import com.example.leave_management.dto.response.ApiResponse;
import com.example.leave_management.dto.response.JwtResponse;
import com.example.leave_management.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest loginRequest) {
        System.out.println("Login request received for user: " + loginRequest.getUsername());
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@RequestBody UserRegistrationDto registrationDto) {
        System.out.println("Received registration request for user: " + registrationDto.getUsername());
        try {
            JwtResponse jwtResponse = authService.registerUser(registrationDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(jwtResponse);
        } catch (Exception e) {
            System.err.println("Error during registration: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(@RequestBody Map<String, String> tokenMap) {
        String token = tokenMap.get("token");
        authService.logout(token);
        return ResponseEntity.ok(new ApiResponse(true, "Logged out successfully"));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<JwtResponse> refreshToken(@RequestBody Map<String, String> tokenMap) {
        String refreshToken = tokenMap.get("refreshToken");
        JwtResponse jwtResponse = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/password-reset-request")
    public ResponseEntity<ApiResponse> requestPasswordReset(@RequestBody Map<String, String> emailMap) {
        String email = emailMap.get("email");
        authService.requestPasswordReset(email);
        return ResponseEntity.ok(new ApiResponse(true, "Password reset email sent"));
    }

    @PostMapping("/validate-reset-token")
    public ResponseEntity<ApiResponse> validateResetToken(@RequestBody Map<String, String> tokenMap) {
        String token = tokenMap.get("token");
        boolean isValid = authService.validatePasswordResetToken(token);
        return ResponseEntity.ok(new ApiResponse(isValid, isValid ? "Token is valid" : "Token is invalid or expired"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@RequestBody PasswordResetDto resetDto) {
        authService.resetPassword(resetDto.getToken(), resetDto.getNewPassword());
        return ResponseEntity.ok(new ApiResponse(true, "Password has been reset successfully"));
    }
}