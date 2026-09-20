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
public class ApplicationDocumentDTO {
    private Long id;
    private String documentType;
    private String documentName;
    private String documentUrl;
    private String fileSize;
    private Boolean verified;
    private String aiDocumentClassification;
    private LocalDateTime uploadedAt;
}
