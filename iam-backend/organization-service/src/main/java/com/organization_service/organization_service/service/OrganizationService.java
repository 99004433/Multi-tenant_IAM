package com.organization_service.organization_service.service;

import com.organization_service.organization_service.dto.OrgRequestDTO;
import com.organization_service.organization_service.dto.OrgResponseDTO;
import com.organization_service.organization_service.dto.PageResponse;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface OrganizationService {

    Mono<OrgResponseDTO> create(OrgRequestDTO request);

    Mono<OrgResponseDTO> update(Long orgId, OrgRequestDTO request);

    Mono<OrgResponseDTO> getById(Long orgId);

    Flux<OrgResponseDTO> getAll();

    Mono<Void> delete(Long orgId);
    public Mono<PageResponse<OrgResponseDTO>> getPaginated(int page, int size);
    
}