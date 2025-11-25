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
                .region(r.getRegion())
                .country(r.getCountry())
                .state(r.getState())
                .city(r.getCity())
                .zipcode(r.getZipcode())
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
                .region(e.getRegion())
                .country(e.getCountry())
                .state(e.getState())
                .city(e.getCity())
                .zipcode(e.getZipcode())
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
        if (r.getRegion() != null) e.setRegion(r.getRegion());
        if (r.getCountry() != null) e.setCountry(r.getCountry());
        if (r.getState() != null) e.setState(r.getState());
        if (r.getCity() != null) e.setCity(r.getCity());
        if (r.getZipcode() != null) e.setZipcode(r.getZipcode());
    }
}
