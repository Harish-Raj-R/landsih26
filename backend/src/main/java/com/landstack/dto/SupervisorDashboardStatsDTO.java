package com.landstack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupervisorDashboardStatsDTO {
    private String departmentName;
    private Long totalDepartmentApplications;
    private Long submittedCount;
    private Long underReviewCount;
    private Long pendingDocumentsCount;
    private Long fieldVerificationCount;
    private Long verifiedCount;
    private Long approvedCount;
    private Long rejectedCount;
    private Long activeFieldOfficers;
    private Map<String, Long> statusBreakdown;
}
