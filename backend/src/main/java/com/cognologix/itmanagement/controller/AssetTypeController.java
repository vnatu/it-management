package com.cognologix.itmanagement.controller;

import com.cognologix.itmanagement.entity.AssetType;
import com.cognologix.itmanagement.service.AssetTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/asset-types")
@RequiredArgsConstructor
public class AssetTypeController {
    private final AssetTypeService typeService;

    @GetMapping
    public List<AssetType> getAllTypes() {
        return typeService.getAllTypes();
    }

    @PostMapping
    public AssetType createType(@RequestBody AssetType type) {
        return typeService.saveType(type);
    }
}
