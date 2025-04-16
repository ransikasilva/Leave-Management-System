package com.example.leave_management.service.impl;

import com.example.leave_management.dto.request.LoginRequest;
import com.example.leave_management.dto.request.UserRegistrationDto;
import com.example.leave_management.dto.response.JwtResponse;
import com.example.leave_management.model.User;
import com.example.leave_management.repository.UserRepository;
import com.example.leave_management.security.JwtTokenProvider;
import com.example.leave_management.service.AuthService;
import com.example.leave_management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Service
public class AuthServiceImpl implements AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;
    private final Set<String> tokenBlacklist = new HashSet<>();

    @Autowired
    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider tokenProvider,
                           UserService userService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.userService = userService;
    }

    @Override
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new JwtResponse(jwt, refreshToken, user.getId(), user.getUsername(), user.getEmail(), user.getRoles());
    }

    @Override
    public JwtResponse registerUser(UserRegistrationDto registrationDto) {
        if (userRepository.existsByUsername(registrationDto.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }

        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        User user = new User();
        user.setUsername(registrationDto.getUsername());
        user.setEmail(registrationDto.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        user.setFirstName(registrationDto.getFirstName());
        user.setLastName(registrationDto.getLastName());

        // Use the roles from the registration DTO instead of hardcoding ROLE_USER
        Set<String> roles = registrationDto.getRoles();
        if (roles == null || roles.isEmpty()) {
            roles = new HashSet<>();
            roles.add("ROLE_USER");
        }
        user.setRoles(roles);

        userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        registrationDto.getUsername(),
                        registrationDto.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        return new JwtResponse(jwt, refreshToken, user.getId(), user.getUsername(), user.getEmail(), user.getRoles());
    }

    @Override
    public boolean validateToken(String token) {
        if (isTokenBlacklisted(token)) {
            return false;
        }
        return tokenProvider.validateToken(token);
    }

    @Override
    public String getUserIdFromToken(String token) {
        return tokenProvider.getUserIdFromToken(token);
    }

    @Override
    public void logout(String token) {
        tokenBlacklist.add(token);
    }

    @Override
    public JwtResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateRefreshToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        String userId = tokenProvider.getUserIdFromRefreshToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newAccessToken = tokenProvider.generateTokenFromUserId(userId);
        String newRefreshToken = tokenProvider.generateRefreshTokenFromUserId(userId);

        return new JwtResponse(newAccessToken, newRefreshToken,
                user.getId(), user.getUsername(),
                user.getEmail(), user.getRoles());
    }

    @Override
    public boolean isTokenBlacklisted(String token) {
        return tokenBlacklist.contains(token);
    }

    @Override
    public void requestPasswordReset(String email) {
        userService.generatePasswordResetToken(email);
    }

    @Override
    public boolean validatePasswordResetToken(String token) {
        return userService.validatePasswordResetToken(token);
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        userService.resetPassword(token, newPassword);
    }
}