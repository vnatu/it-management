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
}
