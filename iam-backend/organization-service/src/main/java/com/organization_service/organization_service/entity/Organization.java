package com.organization_service.organization_service.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.relational.core.mapping.Column;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Table("organization") // R2DBC table mapping
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Organization {

    @Id
    private Long orgId;

    @Column("name")
    private String name;

    @Column("parent_org_id")
    private Long parentOrgId;

    @Column("level")
    private Integer level;

    @Column("address")
    private String address;

    @Column("status")
    private String status;

    @Column("latitude")
    private Double latitude;

    @Column("longitude")
    private Double longitude;

    @Column("region")
    private String region;

    @Column("country")
    private String country;

    @Column("state")
    private String state;

    @Column("city")
    private String city;

    @Column("created_at")
    private LocalDateTime createdAt;

    @Column("updated_at")
    private LocalDateTime updatedAt;
}