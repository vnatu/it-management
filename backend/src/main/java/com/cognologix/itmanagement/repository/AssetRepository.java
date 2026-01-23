package com.cognologix.itmanagement.repository;

import com.cognologix.itmanagement.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    Optional<Asset> findByAssetCustomId(String assetCustomId);
}
