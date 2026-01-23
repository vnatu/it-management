package com.cognologix.itmanagement.repository;

import com.cognologix.itmanagement.entity.AssetHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssetHistoryRepository extends JpaRepository<AssetHistory, Long> {
    List<AssetHistory> findByAssetIdOrderByTimestampDesc(Long assetId);
}
