package com.organization_service.organization_service.service.Impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.organization_service.organization_service.dto.OrgRequestDTO;
import com.organization_service.organization_service.dto.OrgResponseDTO;
import com.organization_service.organization_service.entity.Organization;
import com.organization_service.organization_service.exception.ResourceNotFoundException;
import com.organization_service.organization_service.mapper.OrganizationMapper;
import com.organization_service.organization_service.repository.OrganizationRepository;
import com.organization_service.organization_service.service.OrganizationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository repo;
    private final OrganizationMapper mapper;
    //add later GeocodingService for GPS -> region/country/state/city

    @Override
    public OrgResponseDTO create(OrgRequestDTO request) {
        Organization entity = mapper.toEntity(request);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());

        // optionally call geocoding here if lat/lng present (later)
        Organization saved = repo.save(entity);
        return mapper.toResponse(saved);
    }

    @Override
    public OrgResponseDTO update(Long orgId, OrgRequestDTO request) {
        Organization org = repo.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + orgId));
        mapper.updateEntity(org, request);
        org.setUpdatedAt(LocalDateTime.now());
        Organization saved = repo.save(org);
        return mapper.toResponse(saved);
    }

    @Override
    public OrgResponseDTO getById(Long orgId) {
        Organization org = repo.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + orgId));
        return mapper.toResponse(org);
    }

    @Override
    public List<OrgResponseDTO> getAll() {
        return repo.findAll().stream().map(mapper::toResponse).toList();
    }

    @Override
    public void delete(Long orgId) {
        if (!repo.existsById(orgId)) throw new ResourceNotFoundException("Organization not found: " + orgId);
        repo.deleteById(orgId);
    }
}