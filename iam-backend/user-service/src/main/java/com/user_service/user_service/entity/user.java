package com.user_service.user_service.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

public class user {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long userId;

	    @Column(nullable = false)
	    private Long orgId;   // from organization-service

	    private Long groupId; // from group-service
	    private Long roleId;  // from role-service

	    @Column(nullable = false, unique = true)
	    private String email;

	    private String contactNo;
	    private String name;
	    private String password;
	    private LocalDateTime lastLogin;
	    private String status = "ACTIVE";

	    @CreationTimestamp
	    private LocalDateTime createdAt;

	    @UpdateTimestamp
	    private LocalDateTime updatedAt;

}
