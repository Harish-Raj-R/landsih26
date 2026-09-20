package com.landstack.controller;

import com.landstack.dto.ApplicationResponseDTO;
import com.landstack.dto.FieldDashboardStatsDTO;
import com.landstack.dto.FieldVerificationDTO;
import com.landstack.dto.FieldVerificationRequest;
import com.landstack.entity.User;
import com.landstack.service.AuthService;
import com.landstack.service.FieldVerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/field")
@RequiredArgsConstructor
public class FieldVerificationController {

    private final FieldVerificationService fieldVerificationService;
    private final AuthService authService;

    @GetMapping("/assignments")
    @PreAuthorize("hasAnyRole('FIELD_OFFICER', 'ADMIN')")
    public ResponseEntity<List<ApplicationResponseDTO>> getAssignedApplications(@AuthenticationPrincipal UserDetails userDetails) {
        User fieldOfficer = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(fieldVerificationService.getAssignedApplications(fieldOfficer));
    }

    @PostMapping("/verification")
    @PreAuthorize("hasAnyRole('FIELD_OFFICER', 'ADMIN')")
    public ResponseEntity<FieldVerificationDTO> submitVerification(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody FieldVerificationRequest request) {
        User fieldOfficer = authService.getUserByEmail(userDetails.getUsername());
        return new ResponseEntity<>(fieldVerificationService.submitVerification(fieldOfficer, request), HttpStatus.CREATED);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('FIELD_OFFICER', 'ADMIN')")
    public ResponseEntity<FieldDashboardStatsDTO> getFieldStats(@AuthenticationPrincipal UserDetails userDetails) {
        User fieldOfficer = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(fieldVerificationService.getFieldDashboardStats(fieldOfficer));
    }
}
