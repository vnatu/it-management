package com.cognologix.itmanagement.controller;

import com.cognologix.itmanagement.entity.AssetCategory;
import com.cognologix.itmanagement.service.AssetCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class AssetCategoryServiceController {
    private final AssetCategoryService categoryService;

    @GetMapping
    public List<AssetCategory> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @PostMapping
    public AssetCategory createCategory(@RequestBody AssetCategory category) {
        return categoryService.saveCategory(category);
    }
}
