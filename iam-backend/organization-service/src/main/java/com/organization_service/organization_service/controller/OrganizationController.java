package com.organization_service.organization_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.organization_service.organization_service.dto.OrgHierarchyDTO;
import com.organization_service.organization_service.dto.OrgRequestDTO;
import com.organization_service.organization_service.dto.OrgResponseDTO;
import com.organization_service.organization_service.exception.ResourceNotFoundException;
import com.organization_service.organization_service.service.OrganizationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;


@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService service;


    @PostMapping
    public Mono<ResponseEntity<OrgResponseDTO>> create(@Valid @RequestBody OrgRequestDTO req) {
        return service.create(req)
                      .map(dto -> ResponseEntity.status(201).body(dto));
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<OrgResponseDTO>> get(@PathVariable Long id) {
        return service.getById(id)
                      .map(ResponseEntity::ok)
                      .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping
    public Mono<ResponseEntity<List<OrgResponseDTO>>> all() {
        return service.getAll()
                      .collectList()
                      .map(ResponseEntity::ok);
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<OrgResponseDTO>> update(@PathVariable Long id,
                                                       @Valid @RequestBody OrgRequestDTO req) {
        return service.update(id, req)
                      .map(ResponseEntity::ok)
                      .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<String>> delete(@PathVariable Long id) {
        return service.delete(id)
                      .thenReturn(ResponseEntity.ok("Deleted successfully with ID: " + id));
    }
   
    }