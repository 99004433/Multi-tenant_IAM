package com.role_service.role_service.service.Impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.role_service.role_service.dto.RoleRequestDTO;
import com.role_service.role_service.dto.RoleResponseDTO;
import com.role_service.role_service.entity.Role;
import com.role_service.role_service.exception.ResourceNotFoundException;
import com.role_service.role_service.mapper.RoleMapper;
import com.role_service.role_service.repository.RoleRepository;
import com.role_service.role_service.service.RoleService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository repo;
    private final RoleMapper mapper;

    @Override
    public RoleResponseDTO create(RoleRequestDTO request) {
        Role r = mapper.toEntity(request);
        r.setCreatedAt(LocalDateTime.now());
        r.setUpdatedAt(LocalDateTime.now());
        return mapper.toResponse(repo.save(r));
    }

    @Override
    public RoleResponseDTO update(Long id, RoleRequestDTO request) {
        Role role = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Role not found: " + id));
        mapper.updateEntity(role, request);
        role.setUpdatedAt(LocalDateTime.now());
        return mapper.toResponse(repo.save(role));
    }

    @Override
    public RoleResponseDTO getById(Long id) {
        return repo.findById(id).map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + id));
    }

    @Override
    public List<RoleResponseDTO> getAll() {
        return repo.findAll().stream().map(mapper::toResponse).toList();
    }

    @Override
    public void delete(Long id) {
        if(!repo.existsById(id)) throw new ResourceNotFoundException("Role not found: " + id);
        repo.deleteById(id);
    }
}
