package com.example.leave_management.service;

import com.example.leave_management.model.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    List<User> findAllUsers();

    Optional<User> findUserById(String id);

    Optional<User> findUserByUsername(String username);

    Optional<User> findUserByEmail(String email);

    User saveUser(User user);

    void deleteUser(String id);

    User updateUser(User user);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    void changePassword(String userId, String newPassword);

    String generatePasswordResetToken(String email);

    boolean validatePasswordResetToken(String token);

    void resetPassword(String token, String newPassword);

    Optional<User> findUserByEmployeeId(String employeeId);

    User enableUser(String id);

    User disableUser(String id);

    void updateProfilePicture(String userId, String profilePictureUrl);
}