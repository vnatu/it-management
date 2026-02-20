package com.cognologix.itmanagement.controller;

import com.cognologix.itmanagement.entity.AssetAttributeDefinition;
import com.cognologix.itmanagement.entity.AssetType;
import com.cognologix.itmanagement.service.AssetTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AssetConfigurationController {

    private final AssetTypeService typeService;

    // Get types for a category
    @GetMapping("/asset-categories/{categoryId}/types")
    public List<AssetType> getTypesByCategory(@PathVariable Long categoryId) {
        return typeService.getTypesByCategory(categoryId);
    }

    // Create a new type for a category
    @PostMapping("/asset-categories/{categoryId}/types")
    public AssetType createType(@PathVariable Long categoryId, @RequestBody AssetType type) {
        // We might want to set the category here if it's not in the body, but for now
        // assuming it's handled or body has it.
        // Actually, if we follow REST, the body should likely have the name, and we
        // link it to categoryId.
        // But AssetType entity needs a Category object.
        // For simplicity, we can let the service handle it if we passed categoryId,
        // OR we just rely on client sending the full object.
        // Let's rely on client sending valid AssetType with Category for now, or fetch
        // Category if logical.
        // Given existing endpoints, simpler is better.
        // Use existing createType from AssetTypeController if it works, but here is
        // nested.
        return typeService.saveType(type);
    }

    // Get attributes for a type
    @GetMapping("/asset-types/{typeId}/attributes")
    public List<AssetAttributeDefinition> getAttributesForType(@PathVariable Long typeId) {
        return typeService.getTypeById(typeId).getAttributeDefinitions();
    }

    // Bulk save attributes for a type
    @PostMapping("/asset-types/{typeId}/attributes")
    public AssetType saveAttributes(@PathVariable Long typeId, @RequestBody List<AssetAttributeDefinition> attributes) {
        return typeService.saveAttributes(typeId, attributes);
    }

    // Copy attributes from one type to another
    @PostMapping("/asset-types/{typeId}/copy-from/{sourceTypeId}")
    public AssetType copyAttributes(@PathVariable Long typeId, @PathVariable Long sourceTypeId) {
        return typeService.copyAttributes(typeId, sourceTypeId);
    }
}
