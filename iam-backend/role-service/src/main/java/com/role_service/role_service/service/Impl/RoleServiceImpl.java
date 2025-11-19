package com.role_service.role_service.service.Impl;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.role_service.role_service.dto.RoleRequestDTO;
import com.role_service.role_service.dto.RoleResponseDTO;
import com.role_service.role_service.entity.Role;
import com.role_service.role_service.exception.ResourceNotFoundException;
import com.role_service.role_service.mapper.RoleMapper;
import com.role_service.role_service.repository.RoleRepository;
import com.role_service.role_service.service.RoleService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository repo;
    private final RoleMapper mapper;

    @Override
    public Mono<RoleResponseDTO> create(RoleRequestDTO request) {
        Role r = mapper.toEntity(request);
        r.setCreatedAt(LocalDateTime.now());
        r.setUpdatedAt(LocalDateTime.now());
        return repo.save(r)
                   .map(mapper::toResponse);
    }

    @Override
    public Mono<RoleResponseDTO> update(Long id, RoleRequestDTO request) {
        return repo.findById(id)
                   .switchIfEmpty(Mono.error(new ResourceNotFoundException("Role not found: " + id)))
                   .flatMap(existing -> {
                       mapper.updateEntity(existing, request);
                       existing.setUpdatedAt(LocalDateTime.now());
                       return repo.save(existing);
                   })
                   .map(mapper::toResponse);
    }

    @Override
    public Mono<RoleResponseDTO> getById(Long id) {
        return repo.findById(id)
                   .switchIfEmpty(Mono.error(new ResourceNotFoundException("Role not found: " + id)))
                   .map(mapper::toResponse);
    }

    @Override
    public Flux<RoleResponseDTO> getAll() {
        return repo.findAll()
                   .map(mapper::toResponse);
    }

    @Override
    public Mono<Void> delete(Long id) {
        return repo.existsById(id)
                   .flatMap(exists -> {
                       if (!exists) {
                           return Mono.error(new ResourceNotFoundException("Role not found: " + id));
                       }
                       return repo.deleteById(id);
                   });
    }
}