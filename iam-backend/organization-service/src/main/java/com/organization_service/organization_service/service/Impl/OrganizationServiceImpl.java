package com.organization_service.organization_service.service.Impl;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import com.organization_service.organization_service.dto.OrgRequestDTO;
import com.organization_service.organization_service.dto.OrgResponseDTO;
import com.organization_service.organization_service.entity.Organization;
import com.organization_service.organization_service.exception.ResourceNotFoundException;
import com.organization_service.organization_service.mapper.OrganizationMapper;
import com.organization_service.organization_service.repository.OrganizationRepository;
import com.organization_service.organization_service.service.OrganizationService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository repo;
    private final OrganizationMapper mapper;

    @Override
    public Mono<OrgResponseDTO> create(OrgRequestDTO request) {
        Organization entity = mapper.toEntity(request);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());

        return repo.save(entity)
                   .map(mapper::toResponse);
    }

    @Override
    public Mono<OrgResponseDTO> update(Long orgId, OrgRequestDTO request) {
        return repo.findById(orgId)
                   .switchIfEmpty(Mono.error(new ResourceNotFoundException("Organization not found: " + orgId)))
                   .flatMap(existing -> {
                       mapper.updateEntity(existing, request);
                       existing.setUpdatedAt(LocalDateTime.now());
                       return repo.save(existing);
                   })
                   .map(mapper::toResponse);
    }

    @Override
    public Mono<OrgResponseDTO> getById(Long orgId) {
        return repo.findById(orgId)
                   .switchIfEmpty(Mono.error(new ResourceNotFoundException("Organization not found: " + orgId)))
                   .map(mapper::toResponse);
    }

    @Override
    public Flux<OrgResponseDTO> getAll() {
        return repo.findAll()
                   .map(mapper::toResponse);
    }

    @Override
    public Mono<Void> delete(Long orgId) {
        return repo.existsById(orgId)
                   .flatMap(exists -> {
                       if (!exists) {
                           return Mono.error(new ResourceNotFoundException("Organization not found: " + orgId));
                       }
                       return repo.deleteById(orgId);
                   });
    }
}