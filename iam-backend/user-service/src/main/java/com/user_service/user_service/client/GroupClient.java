package com.user_service.user_service.client;

import com.user_service.user_service.dto.GroupDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "group-service", url = "http://localhost:8082")
public interface GroupClient {
    @GetMapping("/api/groups")
    List<GroupDto> getAllGroups();
}
