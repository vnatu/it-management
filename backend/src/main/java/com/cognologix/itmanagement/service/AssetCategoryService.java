package com.cognologix.itmanagement.service;

import com.cognologix.itmanagement.entity.AssetCategory;
import com.cognologix.itmanagement.repository.AssetCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetCategoryService {
    private final AssetCategoryRepository categoryRepository;

    public List<AssetCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public AssetCategory saveCategory(AssetCategory category) {
        // Link attributes to category before saving if needed
        if (category.getAttributeDefinitions() != null) {
            category.getAttributeDefinitions().forEach(attr -> attr.setCategory(category));
        }
        return categoryRepository.save(category);
    }

    public AssetCategory getCategoryById(Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}
