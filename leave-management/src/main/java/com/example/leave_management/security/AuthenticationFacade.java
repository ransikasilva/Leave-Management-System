package com.example.leave_management.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * A facade to simplify access to authentication information in Spring Security.
 */
@Component
public class AuthenticationFacade {

    /**
     * Gets the current authentication from the security context.
     *
     * @return the current authentication
     */
    public Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    /**
     * Gets the user ID from the currently authenticated user.
     *
     * @return the user ID of the authenticated user
     */
    public String getUserId() {
        Authentication authentication = getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername(); // In our case, this contains the user ID
        }

        return null;
    }

    /**
     * Gets the employee ID from the user's authorities.
     * Note: This is a placeholder implementation; in a real application,
     * you'd likely need to map user ID to employee ID using a service.
     *
     * @return the employee ID or null if not available
     */
    public String getEmployeeId() {
        // In a real implementation, you might look up the employee ID based on user ID
        // For example: return employeeRepository.findByUserId(getUserId()).map(Employee::getId).orElse(null);

        // This is a placeholder implementation
        return getUserId(); // Assuming user ID and employee ID might be the same or related
    }

    /**
     * Checks if the current user has a specific role.
     *
     * @param role the role to check for (without "ROLE_" prefix)
     * @return true if the user has the specified role
     */
    public boolean hasRole(String role) {
        String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return getAuthentication().getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals(roleWithPrefix));
    }
}