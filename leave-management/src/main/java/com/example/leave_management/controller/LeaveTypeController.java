package com.example.leave_management.controller;

import com.example.leave_management.dto.response.ApiResponse;
import com.example.leave_management.model.LeaveType;
import com.example.leave_management.repository.LeaveTypeRepository;
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
@RequestMapping("/api/leave-types")
public class LeaveTypeController {
    private final LeaveTypeRepository leaveTypeRepository;

    @Autowired
    public LeaveTypeController(LeaveTypeRepository leaveTypeRepository) {
        this.leaveTypeRepository = leaveTypeRepository;
    }

    @GetMapping
    public ResponseEntity<List<LeaveType>> getAllLeaveTypes() {
        List<LeaveType> leaveTypes = leaveTypeRepository.findAll();
        return ResponseEntity.ok(leaveTypes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveType> getLeaveTypeById(@PathVariable String id) {
        return leaveTypeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<LeaveType> getLeaveTypeByName(@PathVariable String name) {
        return leaveTypeRepository.findByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/active")
    public ResponseEntity<List<LeaveType>> getActiveLeaveTypes() {
        List<LeaveType> leaveTypes = leaveTypeRepository.findByActive(true);
        return ResponseEntity.ok(leaveTypes);
    }

    @GetMapping("/paid")
    public ResponseEntity<List<LeaveType>> getPaidLeaveTypes() {
        List<LeaveType> leaveTypes = leaveTypeRepository.findByPaidLeave(true);
        return ResponseEntity.ok(leaveTypes);
    }

    @GetMapping("/unpaid")
    public ResponseEntity<List<LeaveType>> getUnpaidLeaveTypes() {
        List<LeaveType> leaveTypes = leaveTypeRepository.findByPaidLeave(false);
        return ResponseEntity.ok(leaveTypes);
    }

    @GetMapping("/requires-approval")
    public ResponseEntity<List<LeaveType>> getLeaveTypesRequiringApproval() {
        List<LeaveType> leaveTypes = leaveTypeRepository.findByRequiresApproval(true);
        return ResponseEntity.ok(leaveTypes);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<LeaveType> createLeaveType(@RequestBody LeaveType leaveType) {
        LeaveType savedLeaveType = leaveTypeRepository.save(leaveType);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLeaveType);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<LeaveType> updateLeaveType(@PathVariable String id, @RequestBody LeaveType leaveType) {
        return leaveTypeRepository.findById(id)
                .map(existingLeaveType -> {
                    leaveType.setId(id);
                    LeaveType updatedLeaveType = leaveTypeRepository.save(leaveType);
                    return ResponseEntity.ok(updatedLeaveType);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteLeaveType(@PathVariable String id) {
        return leaveTypeRepository.findById(id)
                .map(leaveType -> {
                    leaveTypeRepository.deleteById(id);
                    return ResponseEntity.ok(new ApiResponse(true, "Leave type deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<LeaveType> activateLeaveType(@PathVariable String id) {
        return leaveTypeRepository.findById(id)
                .map(leaveType -> {
                    leaveType.setActive(true);
                    LeaveType updatedLeaveType = leaveTypeRepository.save(leaveType);
                    return ResponseEntity.ok(updatedLeaveType);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<LeaveType> deactivateLeaveType(@PathVariable String id) {
        return leaveTypeRepository.findById(id)
                .map(leaveType -> {
                    leaveType.setActive(false);
                    LeaveType updatedLeaveType = leaveTypeRepository.save(leaveType);
                    return ResponseEntity.ok(updatedLeaveType);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}