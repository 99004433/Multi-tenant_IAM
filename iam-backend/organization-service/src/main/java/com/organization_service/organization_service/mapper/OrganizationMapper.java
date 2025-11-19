package com.organization_service.organization_service.mapper;

import org.springframework.stereotype.Component;

import com.organization_service.organization_service.dto.OrgRequestDTO;
import com.organization_service.organization_service.dto.OrgResponseDTO;
import com.organization_service.organization_service.entity.Organization;

@Component
public class OrganizationMapper {

    public Organization toEntity(OrgRequestDTO r) {
        return Organization.builder()
                .name(r.getName())
                .parentOrgId(r.getParentOrgId())
                .level(r.getLevel())
                .address(r.getAddress())
                .status(r.getStatus())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .build();
    }

    public OrgResponseDTO toResponse(Organization e) {
        return OrgResponseDTO.builder()
                .orgId(e.getOrgId())
                .name(e.getName())
                .parentOrgId(e.getParentOrgId())
                .level(e.getLevel())
                .address(e.getAddress())
                .status(e.getStatus())
                .latitude(e.getLatitude())
                .longitude(e.getLongitude())
                .region(e.getRegion())
                .country(e.getCountry())
                .state(e.getState())
                .city(e.getCity())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    public void updateEntity(Organization e, OrgRequestDTO r) {
        if (r.getName() != null) e.setName(r.getName());
        e.setParentOrgId(r.getParentOrgId());
        e.setLevel(r.getLevel());
        if (r.getAddress() != null) e.setAddress(r.getAddress());
        if (r.getStatus() != null) e.setStatus(r.getStatus());
        if (r.getLatitude() != null) e.setLatitude(r.getLatitude());
        if (r.getLongitude() != null) e.setLongitude(r.getLongitude());
        // geocoding update performed elsewhere if lat/lng changed
    }
}
