package com.cognologix.itmanagement.repository;

import com.cognologix.itmanagement.entity.AssetCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AssetCategoryRepository extends JpaRepository<AssetCategory, Long> {
    Optional<AssetCategory> findByName(String name);
}
