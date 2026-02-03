package com.cognologix.itmanagement.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "asset_attribute_definitions")
@Getter
@Setter
public class AssetAttributeDefinition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_type_id", nullable = false)
    @JsonBackReference
    private AssetType assetType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttributeSection section;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttributeDataType dataType;

    private boolean required;
}
