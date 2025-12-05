
package com.group_service.group_service.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Table("groups")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Group {

    @Id
    @Column("group_id")
    private Long groupId;

    @Column("org_id")
    private Long orgId; // ✅ Should be NOT NULL in DB

    @Column("name")
    private String name;

    @Column("description")
    private String description;

    @Column("status")
    private String status; // ✅ Consider using Enum for better type safety

    @Column("allowed_role_ids")
    private List<Long> allowedRoleIds; // ✅ With PostgreSQL BIGINT[] + R2DBC converters

    @Column("created_at")
    private LocalDateTime createdAt;

    @Column("updated_at")
    private LocalDateTime updatedAt;

    // -------------------------
    // Mutator methods (setters)
    // -------------------------

    /**
     * Set updatedAt to the provided timestamp.
     * Service/auditing layer should decide the moment of update.
     */
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * Set name with safe trimming. Keeps nulls as null.
     */
    public void setName(String name) {
        this.name = safeTrim(name);
    }

    /**
     * Set description with safe trimming. Keeps nulls as null.
     */
    public void setDescription(String description) {
        this.description = safeTrim(description);
    }

    /**
     * Set allowedRoleIds with defensive copy.
     * If the DB expects a mutable list, use new ArrayList<>(source).
     * If null is passed, stores null.
     */
    public void setAllowedRoleIds(List<Long> allowedRoleIds) {
        this.allowedRoleIds = copyMutableList(allowedRoleIds);
    }

    /**
     * Set status as String, trimmed. Keeps nulls as null.
     * (If you migrate to enum, change field + setter accordingly.)
     */
    public void setStatus(String status) {
        this.status = status == null ? null : status.trim();
    }

    // -------------------------
    // Private helper methods
    // -------------------------

    private String safeTrim(String s) {
        return s == null ? null : s.trim();
    }

    /**
     * Creates a defensive, mutable copy of the list (or null if source is null).
     * Using mutable copy here can help with R2DBC mapping and change tracking.
     */
    private <T> List<T> copyMutableList(List<T> source) {
        return source == null ? null : new ArrayList<>(source);
    }
}
