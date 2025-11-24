package com.role_service.role_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.role_service.role_service.dto.RoleRequestDTO;
import com.role_service.role_service.dto.RoleResponseDTO;
import com.role_service.role_service.service.RoleService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@CrossOrigin(origins = "http://localhost:5000")
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService service;

    @PostMapping
    public Mono<ResponseEntity<RoleResponseDTO>> create(@RequestBody RoleRequestDTO req) {
        return service.create(req)
                      .map(dto -> ResponseEntity.status(201).body(dto));
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<RoleResponseDTO>> get(@PathVariable Long id) {
        return service.getById(id)
                      .map(ResponseEntity::ok)
                      .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping
    public Mono<ResponseEntity<List<RoleResponseDTO>>> all() {
        return service.getAll()
                      .collectList()
                      .map(ResponseEntity::ok);
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<RoleResponseDTO>> update(@PathVariable Long id, @RequestBody RoleRequestDTO req) {
        return service.update(id, req)
                      .map(ResponseEntity::ok)
                      .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> delete(@PathVariable Long id) {
        return service.delete(id)
                      .thenReturn(ResponseEntity.noContent().build());
    }
}