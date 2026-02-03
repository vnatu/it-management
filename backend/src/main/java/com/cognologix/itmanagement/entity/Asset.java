package com.cognologix.itmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "assets")
@Getter
@Setter
public class Asset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String assetCustomId; // Custom ID from system

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "type_id", nullable = false)
    private AssetType type;

    private String brand;
    private String modelNo;
    private String serialNo;
    private String sku;
    private String color;

    @Enumerated(EnumType.STRING)
    private AssetStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    private LocalDate purchaseDate;
    private LocalDate warrantyStart;
    private LocalDate warrantyEnd;
    private BigDecimal price;
    private String vendorInfo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "location_id")
    private Location location;

    @Column(name = "location") // Temporarily map to old column for migration
    private String oldLocation;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate allocationDate;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> technicalSpecs;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "asset_tags", joinColumns = @JoinColumn(name = "asset_id"), inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private Set<Tag> tags = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
