package com.cognologix.itmanagement.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "asset_history")
@Getter
@Setter
public class AssetHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    @JsonIgnore
    private Asset asset;

    private String action; // E.g., CREATED, UPDATED, ASSIGNED

    private Long changedByUserId;

    private LocalDateTime timestamp;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String prevStateJson;

    @Column(columnDefinition = "TEXT")
    private String nextStateJson;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
