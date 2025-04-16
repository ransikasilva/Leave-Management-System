package com.example.leave_management.controller;

import com.example.leave_management.dto.response.ApiResponse;
import com.example.leave_management.model.User;
import com.example.leave_management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @authenticationFacade.getUserId() == #id")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userService.findUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User savedUser = userService.saveUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @authenticationFacade.getUserId() == #id")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User user) {
        return userService.findUserById(id)
                .map(existingUser -> {
                    user.setId(id);
                    User updatedUser = userService.updateUser(user);
                    return ResponseEntity.ok(updatedUser);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable String id) {
        return userService.findUserById(id)
                .map(user -> {
                    userService.deleteUser(id);
                    return ResponseEntity.ok(new ApiResponse(true, "User deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/change-password")
    @PreAuthorize("hasRole('ADMIN') or @authenticationFacade.getUserId() == #id")
    public ResponseEntity<ApiResponse> changePassword(@PathVariable String id, @RequestBody String newPassword) {
        userService.changePassword(id, newPassword);
        return ResponseEntity.ok(new ApiResponse(true, "Password changed successfully"));
    }

    @PutMapping("/{id}/profile-picture")
    @PreAuthorize("hasRole('ADMIN') or @authenticationFacade.getUserId() == #id")
    public ResponseEntity<ApiResponse> updateProfilePicture(@PathVariable String id, @RequestBody String profilePictureUrl) {
        userService.updateProfilePicture(id, profilePictureUrl);
        return ResponseEntity.ok(new ApiResponse(true, "Profile picture updated successfully"));
    }

    @PutMapping("/{id}/enable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> enableUser(@PathVariable String id) {
        User user = userService.enableUser(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/disable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> disableUser(@PathVariable String id) {
        User user = userService.disableUser(id);
        return ResponseEntity.ok(user);
    }
}