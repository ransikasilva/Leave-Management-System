package com.example.leave_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/auth-check")
    public ResponseEntity<?> testAuth() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Map<String, Object> response = new HashMap<>();
        if (authentication != null && authentication.isAuthenticated()
                && !authentication.getAuthorities().toString().contains("ROLE_ANONYMOUS")) {
            response.put("authenticated", true);
            response.put("name", authentication.getName());
            response.put("principal", authentication.getPrincipal().toString());
            response.put("authorities", authentication.getAuthorities().toString());
            return ResponseEntity.ok(response);
        } else {
            response.put("authenticated", false);
            if (authentication != null) {
                response.put("authorities", authentication.getAuthorities().toString());
            }
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/headers")
    public ResponseEntity<?> getHeaders(jakarta.servlet.http.HttpServletRequest request) {
        Map<String, String> headers = new HashMap<>();
        java.util.Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            String headerValue = request.getHeader(headerName);
            // Mask sensitive data like full authorization tokens
            if (headerName.equalsIgnoreCase("authorization") && headerValue.length() > 15) {
                headerValue = headerValue.substring(0, 15) + "...";
            }
            headers.put(headerName, headerValue);
        }
        return ResponseEntity.ok(headers);
    }
}