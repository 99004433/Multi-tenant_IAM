package com.organization_service.organization_service.dto;

import java.util.List;

import lombok.Data;

@Data
public class OrgHierarchyDTO {
    private Long orgId;
    private String name;
    private int level;
    private String status;
    private List<OrgHierarchyDTO> children;
}

