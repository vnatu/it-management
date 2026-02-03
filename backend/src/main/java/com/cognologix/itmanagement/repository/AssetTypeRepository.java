package com.cognologix.itmanagement.repository;

import com.cognologix.itmanagement.entity.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetTypeRepository extends JpaRepository<AssetType, Long> {
    List<AssetType> findByCategoryId(Long categoryId);
}
