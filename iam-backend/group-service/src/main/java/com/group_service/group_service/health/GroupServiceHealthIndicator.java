package com.group_service.group_service.health;


import com.group_service.group_service.repository.GroupRepository;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class GroupServiceHealthIndicator implements HealthIndicator {

    private final GroupRepository groupRepository;

    public GroupServiceHealthIndicator(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    @Override
    public Health health() {
        try {
            // Simple check: can we access DB?
            Mono<Long> count = groupRepository.count();
            Long result = count.block(); // blocking only for health check
            return Health.up().withDetail("GroupCount", result).build();
        } catch (Exception e) {
            return Health.down().withDetail("Error", e.getMessage()).build();
        }
    }
}
