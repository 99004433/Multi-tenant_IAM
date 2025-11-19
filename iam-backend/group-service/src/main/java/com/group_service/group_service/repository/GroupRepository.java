package com.group_service.group_service.repository;

import com.group_service.group_service.entity.Group;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

public interface GroupRepository extends ReactiveCrudRepository<Group, Long> {
}
