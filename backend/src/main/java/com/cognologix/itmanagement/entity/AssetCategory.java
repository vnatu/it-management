package com.cognologix.itmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "asset_categories")
@Getter
@Setter
public class AssetCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    private CategoryType type; // IT, NON_IT

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "category_tags", joinColumns = @JoinColumn(name = "category_id"), inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private Set<Tag> tags = new HashSet<>();
}
