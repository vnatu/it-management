package com.cognologix.itmanagement.service;

import com.cognologix.itmanagement.entity.Asset;
import com.cognologix.itmanagement.entity.AssetHistory;
import com.cognologix.itmanagement.repository.AssetHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetHistoryService {
    private final AssetHistoryRepository historyRepository;

    public void logChange(Asset asset, String action, String notes, String prevState, String nextState) {
        AssetHistory history = new AssetHistory();
        history.setAsset(asset);
        history.setAction(action);
        history.setNotes(notes);
        history.setPrevStateJson(prevState);
        history.setNextStateJson(nextState);
        historyRepository.save(history);
    }

    public List<AssetHistory> getHistoryForAsset(Long assetId) {
        return historyRepository.findByAssetIdOrderByTimestampDesc(assetId);
    }
}
