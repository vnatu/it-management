package com.cognologix.itmanagement.controller;

import com.cognologix.itmanagement.entity.AssetHistory;
import com.cognologix.itmanagement.service.AssetHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class AssetHistoryController {
    private final AssetHistoryService historyService;

    @GetMapping("/asset/{assetId}")
    public List<AssetHistory> getHistoryForAsset(@PathVariable Long assetId) {
        return historyService.getHistoryForAsset(assetId);
    }
}
