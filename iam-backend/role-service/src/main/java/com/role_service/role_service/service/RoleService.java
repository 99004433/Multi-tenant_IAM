package com.role_service.role_service.service;

import com.role_service.role_service.dto.RoleRequestDTO;
import com.role_service.role_service.dto.RoleResponseDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface RoleService {

    Mono<RoleResponseDTO> create(RoleRequestDTO request);

    Mono<RoleResponseDTO> update(Long id, RoleRequestDTO request);

    Mono<RoleResponseDTO> getById(Long id);

    Flux<RoleResponseDTO> getAll();

    Mono<Void> delete(Long id);
}