package com.organization_service.organization_service.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "organization")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Organization {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orgId;

    @Column(nullable = false)
    private String name;

    private Long parentOrgId;
    private Integer level;
    private String address;
    private String status; // ACTIVE / INACTIVE

    // GPS/autofill fields
    private Double latitude;
    private Double longitude;
    private String region;
    private String country;
    private String state;
    private String city;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
