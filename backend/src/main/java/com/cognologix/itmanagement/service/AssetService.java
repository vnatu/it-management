package com.cognologix.itmanagement.service;

import com.cognologix.itmanagement.entity.Asset;
import com.cognologix.itmanagement.entity.AssetAttributeDefinition;
import com.cognologix.itmanagement.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AssetService {
    private final AssetRepository assetRepository;
    private final AssetHistoryService historyService;

    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }

    public Optional<Asset> getAssetById(Long id) {
        return assetRepository.findById(id);
    }

    public Optional<Asset> getAssetByCustomId(String customId) {
        return assetRepository.findByAssetCustomId(customId);
    }

    public Asset saveAsset(Asset asset) {
        validateAttributes(asset);
        boolean isNew = asset.getId() == null;
        Asset savedAsset = assetRepository.save(asset);
        historyService.logChange(savedAsset, isNew ? "CREATED" : "UPDATED",
                isNew ? "Asset details saved" : "Asset details updated", null, null);
        return savedAsset;
    }

    private void validateAttributes(Asset asset) {
        if (asset.getType() == null || asset.getType().getCategory() == null) {
            return;
        }

        List<AssetAttributeDefinition> definitions = asset.getType().getCategory().getAttributeDefinitions();
        if (definitions == null || definitions.isEmpty()) {
            return;
        }

        Map<String, Object> specs = asset.getTechnicalSpecs();
        for (AssetAttributeDefinition def : definitions) {
            if (def.isRequired()
                    && (specs == null || !specs.containsKey(def.getName()) || specs.get(def.getName()) == null)) {
                throw new RuntimeException("Attribute '" + def.getName() + "' is required for category "
                        + asset.getType().getCategory().getName());
            }
        }
    }

    public void deleteAsset(Long id) {
        assetRepository.deleteById(id);
    }
}
