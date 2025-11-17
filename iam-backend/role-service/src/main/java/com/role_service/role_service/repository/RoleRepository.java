package com.role_service.role_service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.role_service.role_service.entity.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}