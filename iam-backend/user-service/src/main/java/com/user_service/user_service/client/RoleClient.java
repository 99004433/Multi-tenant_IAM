package com.user_service.user_service.client;

import com.user_service.user_service.dto.RoleDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "role-service", url = "http://localhost:8083")
public interface RoleClient {
        @GetMapping("/api/roles")
        List<RoleDto> getAllRoles();

        @GetMapping(value = "/api/roles", params = "groupId")
        List<RoleDto> getRolesByGroup(@RequestParam("groupId") Long groupId);
}
