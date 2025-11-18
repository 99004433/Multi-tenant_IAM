package com.user_service.user_service.controller;

import com.user_service.user_service.dto.UserRequestDto;
import com.user_service.user_service.dto.UserResponseDto;
import com.user_service.user_service.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

//    @PostMapping("/save")
//    public ResponseEntity<UserRequestDto> create(@Valid @RequestBody UserRequestDto req) {
//        UserRequestDto created = userService.createUser(req);
//        return ResponseEntity.created(URI.create("/users/" + created.getEmail())) // or use ID if available
//                .body(created);
//    }
@PostMapping("/save")
public ResponseEntity<UserResponseDto> create(@Valid @RequestBody UserRequestDto req) {
    UserResponseDto created = userService.createUser(req);
    URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getUserId())
            .toUri();
    return ResponseEntity.created(location).body(created);
}


    @GetMapping("/getUserById/{id}")
    public ResponseEntity<UserResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }


    @GetMapping("/getAllUsers")
    public ResponseEntity<List<UserResponseDto>> getAll() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/updateById/{id}")
    public ResponseEntity<UserResponseDto> update(@PathVariable Long id, @Valid @RequestBody UserRequestDto req) {
        return ResponseEntity.ok(userService.updateUser(id, req));
    }

    @DeleteMapping("/deleteById/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }




}