package com.landstack.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "field_verifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FieldVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_request_id", nullable = false, unique = true)
    @JsonIgnore
    private ServiceRequest serviceRequest;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "field_officer_id", nullable = false)
    private User fieldOfficer;

    private LocalDateTime inspectionDate;

    private Double gpsLatitude;

    private Double gpsLongitude;

    @Builder.Default
    private Boolean gpsCoordinatesVerified = true;

    @Builder.Default
    private Boolean boundaryMatchesRecord = true;

    @Builder.Default
    private Boolean encroachmentDetected = false;

    @Column(length = 2000)
    private String remarks;

    @Column(columnDefinition = "TEXT")
    private String photoUrls;

    @Column(nullable = false, length = 40)
    private String verificationResult; // e.g. "VERIFIED_COMPLIANT", "ENCROACHMENT_FLAGGED", "DISCREPANCY_FOUND"

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime submittedAt;
}
