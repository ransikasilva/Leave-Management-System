package com.example.leave_management.service.impl;

import com.example.leave_management.model.User;
import com.example.leave_management.repository.UserRepository;
import com.example.leave_management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.Instant;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> findUserById(String id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User saveUser(User user) {
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    @Override
    public User updateUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public void changePassword(String userId, String newPassword) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
        });
    }

    @Override
    public String generatePasswordResetToken(String email) {
        String token = UUID.randomUUID().toString();

        userRepository.findByEmail(email).ifPresent(user -> {
            user.setResetPasswordToken(token);
            user.setResetPasswordExpiry(Instant.now().plusSeconds(3600).getEpochSecond());
            userRepository.save(user);
        });

        return token;
    }

    @Override
    public boolean validatePasswordResetToken(String token) {
        Optional<User> userOpt = userRepository.findByResetPasswordToken(token);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Long expiryTime = user.getResetPasswordExpiry();

            if (expiryTime != null && expiryTime > Instant.now().getEpochSecond()) {
                return true;
            }
        }

        return false;
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        userRepository.findByResetPasswordToken(token).ifPresent(user -> {
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setResetPasswordToken(null);
            user.setResetPasswordExpiry(null);
            userRepository.save(user);
        });
    }

    @Override
    public Optional<User> findUserByEmployeeId(String employeeId) {
        return userRepository.findByEmployeeId(employeeId);
    }

    @Override
    public User enableUser(String id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setEnabled(true);
            return userRepository.save(user);
        }
        return null;
    }

    @Override
    public User disableUser(String id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setEnabled(false);
            return userRepository.save(user);
        }
        return null;
    }

    @Override
    public void updateProfilePicture(String userId, String profilePictureUrl) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setProfilePictureUrl(profilePictureUrl);
            userRepository.save(user);
        });
    }
}