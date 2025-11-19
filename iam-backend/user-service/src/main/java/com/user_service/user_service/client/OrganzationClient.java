package com.user_service.user_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "organization-service", url = "http://localhost:8081")
public interface OrganzationClient {
    @GetMapping("/api/organizations/{id}")
    Object getOrganizationById(@PathVariable("id") Long id);
}

