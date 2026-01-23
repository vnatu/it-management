package com.cognologix.itmanagement.repository;

import com.cognologix.itmanagement.entity.AssetCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetCategoryRepository extends JpaRepository<AssetCategory, Long> {
}
