package com.landstack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FieldDashboardStatsDTO {
    private Long assignedInspectionsCount;
    private Long pendingVerificationCount;
    private Long completedVerificationCount;
    private Long todayVisitsCount;
}
