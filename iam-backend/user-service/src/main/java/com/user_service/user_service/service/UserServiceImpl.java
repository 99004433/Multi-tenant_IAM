package com.user_service.user_service.service;

import com.user_service.user_service.client.GroupClient;
import com.user_service.user_service.client.OrganzationClient;
import com.user_service.user_service.client.RoleClient;
import com.user_service.user_service.dto.UserRequestDto;
import com.user_service.user_service.dto.UserResponseDto;
import com.user_service.user_service.entity.User;
import com.user_service.user_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private GroupClient groupClient;
    @Autowired
    private RoleClient roleClient;
    @Autowired
    private OrganzationClient orgClient;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();


    @Override
    public UserResponseDto createUser(UserRequestDto userRequestDto) {
        // Hash the password
        String hashedPassword = passwordEncoder.encode(userRequestDto.getPassword());

        // Convert DTO to Entity
        User entity = User.builder()
                .firstName(userRequestDto.getFirstName())
                .middleName(userRequestDto.getMiddleName())
                .lastName(userRequestDto.getLastName())
                .email(userRequestDto.getEmail())
                .orgId(userRequestDto.getOrgId())
                .groupId(userRequestDto.getGroupId())
                .roleId(userRequestDto.getRoleId())
                .contactNo(userRequestDto.getContactNo())
                .password(hashedPassword)
                .status("ACTIVE")
                .build();

        // Save entity
        entity = userRepository.save(entity);

        // Convert back to DTO (without password)

        return UserResponseDto.builder()
                .userId(entity.getUserId()) // include ID for URI
                .firstName(entity.getFirstName())
                .middleName(entity.getMiddleName())
                .lastName(entity.getLastName())
                .email(entity.getEmail())
                .orgId(entity.getOrgId())
                .groupId(entity.getGroupId())
                .roleId(entity.getRoleId())
                .contactNo(entity.getContactNo())
                .status(entity.getStatus())
                .build();

    }



    @Override
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public UserResponseDto updateUser(Long userId, UserRequestDto userRequestDto) {
        User entity = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        entity.setFirstName(userRequestDto.getFirstName());
        entity.setMiddleName(userRequestDto.getMiddleName());
        entity.setLastName(userRequestDto.getLastName());
        entity.setEmail(userRequestDto.getEmail());
        entity.setOrgId(userRequestDto.getOrgId());
        entity.setGroupId(userRequestDto.getGroupId());
        entity.setRoleId(userRequestDto.getRoleId());
        entity.setContactNo(userRequestDto.getContactNo());

        if (userRequestDto.getPassword() != null && !userRequestDto.getPassword().isBlank()) {
            entity.setPassword(passwordEncoder.encode(userRequestDto.getPassword()));
        }

        entity = userRepository.save(entity);
        return mapToResponse(entity);
    }

    @Override
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        userRepository.deleteById(userId);
    }


    @Override
    public UserResponseDto getUserById(Long userId) {
        User entity = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return mapToResponse(entity);
    }


    private UserResponseDto mapToResponse(User entity) {
        return UserResponseDto.builder()
                .userId(entity.getUserId())
                .firstName(entity.getFirstName())
                .middleName(entity.getMiddleName())
                .lastName(entity.getLastName())
                .email(entity.getEmail())
                .orgId(entity.getOrgId())
                .groupId(entity.getGroupId())
                .roleId(entity.getRoleId())
                .contactNo(entity.getContactNo())
                .lastLogin(entity.getLastLogin())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }


}
