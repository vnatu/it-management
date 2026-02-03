package com.cognologix.itmanagement.service;

import com.cognologix.itmanagement.entity.AssetType;
import com.cognologix.itmanagement.repository.AssetTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetTypeService {
    private final AssetTypeRepository typeRepository;

    public List<AssetType> getAllTypes() {
        return typeRepository.findAll();
    }

    public AssetType saveType(AssetType type) {
        return typeRepository.save(type);
    }

    public List<AssetType> getTypesByCategory(Long categoryId) {
        return typeRepository.findByCategoryId(categoryId);
    }

    public AssetType getTypeById(Long id) {
        return typeRepository.findById(id).orElseThrow(() -> new RuntimeException("Asset Type not found"));
    }

    public AssetType saveAttributes(Long typeId,
            java.util.List<com.cognologix.itmanagement.entity.AssetAttributeDefinition> attributes) {
        AssetType type = getTypeById(typeId);

        // Clear existing attributes if necessary or merging login.
        // For now, replacing all seems safer for "configuration"
        if (type.getAttributeDefinitions() != null) {
            type.getAttributeDefinitions().clear();
        } else {
            type.setAttributeDefinitions(new java.util.ArrayList<>());
        }

        if (attributes != null) {
            attributes.forEach(attr -> {
                attr.setAssetType(type);
                type.getAttributeDefinitions().add(attr);
            });
        }

        return typeRepository.save(type);
    }

}
