package com.landstack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FieldVerificationDTO {
    private Long id;
    private Long applicationId;
    private Long fieldOfficerId;
    private String fieldOfficerName;
    private LocalDateTime inspectionDate;
    private Double gpsLatitude;
    private Double gpsLongitude;
    private Boolean gpsCoordinatesVerified;
    private Boolean boundaryMatchesRecord;
    private Boolean encroachmentDetected;
    private String remarks;
    private String photoUrls;
    private String verificationResult;
    private LocalDateTime submittedAt;
}
