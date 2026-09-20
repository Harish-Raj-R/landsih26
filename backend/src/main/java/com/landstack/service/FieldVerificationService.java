package com.landstack.service;

import com.landstack.dto.ApplicationResponseDTO;
import com.landstack.dto.FieldDashboardStatsDTO;
import com.landstack.dto.FieldVerificationDTO;
import com.landstack.dto.FieldVerificationRequest;
import com.landstack.entity.*;
import com.landstack.exception.BadRequestException;
import com.landstack.exception.ResourceNotFoundException;
import com.landstack.exception.UnauthorizedException;
import com.landstack.repository.FieldVerificationRepository;
import com.landstack.repository.ServiceRequestRepository;
import com.landstack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FieldVerificationService {

    private final FieldVerificationRepository fieldVerificationRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final UserRepository userRepository;
    private final ApplicationService applicationService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<ApplicationResponseDTO> getAssignedApplications(User fieldOfficer) {
        return serviceRequestRepository.findByFieldOfficerOrderByCreatedAtDesc(fieldOfficer).stream()
                .map(applicationService::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FieldVerificationDTO submitVerification(User fieldOfficer, FieldVerificationRequest request) {
        if (fieldOfficer.getRole().getName() != RoleType.FIELD_OFFICER && fieldOfficer.getRole().getName() != RoleType.ADMIN) {
            throw new UnauthorizedException("Only field officers can submit physical site verifications.");
        }

        ServiceRequest app = serviceRequestRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID: " + request.getApplicationId()));

        if (fieldOfficer.getRole().getName() == RoleType.FIELD_OFFICER &&
            (app.getFieldOfficer() == null || !app.getFieldOfficer().getId().equals(fieldOfficer.getId()))) {
            throw new UnauthorizedException("You are not assigned to this application.");
        }

        FieldVerification verification = FieldVerification.builder()
                .serviceRequest(app)
                .fieldOfficer(fieldOfficer)
                .inspectionDate(LocalDateTime.now())
                .gpsLatitude(request.getGpsLatitude() != null ? request.getGpsLatitude() : app.getParcel().getLatitude())
                .gpsLongitude(request.getGpsLongitude() != null ? request.getGpsLongitude() : app.getParcel().getLongitude())
                .gpsCoordinatesVerified(request.getGpsCoordinatesVerified() != null ? request.getGpsCoordinatesVerified() : true)
                .boundaryMatchesRecord(request.getBoundaryMatchesRecord() != null ? request.getBoundaryMatchesRecord() : true)
                .encroachmentDetected(request.getEncroachmentDetected() != null ? request.getEncroachmentDetected() : false)
                .remarks(request.getRemarks())
                .photoUrls(request.getPhotoUrls() != null ? request.getPhotoUrls() : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800")
                .verificationResult(request.getVerificationResult())
                .build();

        verification = fieldVerificationRepository.save(verification);
        app.setFieldVerification(verification);
        app.setFieldOfficerRemarks(request.getRemarks());
        app.setStatus(ApplicationStatus.VERIFIED);
        serviceRequestRepository.save(app);

        auditLogService.logAction(fieldOfficer, "SUBMIT_FIELD_VERIFICATION", "FIELD_VERIFICATION", verification.getId().toString(),
                "Submitted physical site verification for application " + app.getApplicationNumber() + " with result: " + request.getVerificationResult(), null);

        // Notify supervisor
        if (app.getSupervisor() != null) {
            notificationService.createNotification(app.getSupervisor(), "Field Verification Completed",
                    "Field Officer " + fieldOfficer.getFullName() + " submitted inspection report for " + app.getApplicationNumber() + " (Result: " + request.getVerificationResult() + ")",
                    "STATUS_UPDATE", app.getApplicationNumber());
        } else {
            // notify department supervisors
            List<User> supervisors = userRepository.findByDepartmentAndRoleName(app.getDepartment(), RoleType.DEPARTMENT_SUPERVISOR);
            for (User sup : supervisors) {
                notificationService.createNotification(sup, "Field Verification Completed",
                        "Field verification submitted for " + app.getApplicationNumber() + ", awaiting your final review",
                        "STATUS_UPDATE", app.getApplicationNumber());
            }
        }

        // Notify citizen
        notificationService.createNotification(app.getCitizen(), "Field Verification Completed",
                "Physical inspection has been completed for parcel " + app.getParcel().getUlpin() + ". Application is now under final review.",
                "STATUS_UPDATE", app.getApplicationNumber());

        return mapToDTO(verification);
    }

    @Transactional(readOnly = true)
    public FieldDashboardStatsDTO getFieldDashboardStats(User fieldOfficer) {
        List<ServiceRequest> assigned = serviceRequestRepository.findByFieldOfficerOrderByCreatedAtDesc(fieldOfficer);
        long pending = assigned.stream().filter(a -> a.getStatus() == ApplicationStatus.FIELD_VERIFICATION).count();
        long completed = assigned.stream().filter(a -> a.getStatus() == ApplicationStatus.VERIFIED || a.getStatus() == ApplicationStatus.APPROVED || a.getStatus() == ApplicationStatus.COMPLETED).count();

        return FieldDashboardStatsDTO.builder()
                .assignedInspectionsCount((long) assigned.size())
                .pendingVerificationCount(pending)
                .completedVerificationCount(completed)
                .todayVisitsCount(Math.min(pending, 3L))
                .build();
    }

    private FieldVerificationDTO mapToDTO(FieldVerification fv) {
        return FieldVerificationDTO.builder()
                .id(fv.getId())
                .applicationId(fv.getServiceRequest().getId())
                .fieldOfficerId(fv.getFieldOfficer().getId())
                .fieldOfficerName(fv.getFieldOfficer().getFullName())
                .inspectionDate(fv.getInspectionDate())
                .gpsLatitude(fv.getGpsLatitude())
                .gpsLongitude(fv.getGpsLongitude())
                .gpsCoordinatesVerified(fv.getGpsCoordinatesVerified())
                .boundaryMatchesRecord(fv.getBoundaryMatchesRecord())
                .encroachmentDetected(fv.getEncroachmentDetected())
                .remarks(fv.getRemarks())
                .photoUrls(fv.getPhotoUrls())
                .verificationResult(fv.getVerificationResult())
                .submittedAt(fv.getSubmittedAt())
                .build();
    }
}
