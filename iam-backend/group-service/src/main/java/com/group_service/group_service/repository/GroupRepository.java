package com.group_service.group_service.repository;

import com.group_service.group_service.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<Group, Long> {
}
