package com.cognologix.itmanagement.service;

import com.cognologix.itmanagement.entity.AssetStatus;
import com.cognologix.itmanagement.entity.Location;
import com.cognologix.itmanagement.repository.AssetRepository;
import com.cognologix.itmanagement.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LocationService {
    private final LocationRepository locationRepository;
    private final AssetRepository assetRepository;

    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    public List<Location> getActiveLocations() {
        return locationRepository.findByIsActiveTrue();
    }

    public Optional<Location> getLocationById(Long id) {
        return locationRepository.findById(id);
    }

    public Location saveLocation(Location location) {
        return locationRepository.save(location);
    }

    public void setLocationStatus(Long id, boolean active) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        if (!active) {
            long activeAssets = assetRepository.countByLocationAndStatusNot(location, AssetStatus.DECOMMISSIONED);
            if (activeAssets > 0) {
                throw new RuntimeException(
                        "Cannot deactivate location. It still has " + activeAssets + " active assets assigned.");
            }
        }

        location.setActive(active);
        locationRepository.save(location);
    }

    public void deleteLocation(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        long assetCount = assetRepository.countByLocationAndStatusNot(location, AssetStatus.DECOMMISSIONED);
        if (assetCount > 0) {
            throw new RuntimeException("Cannot delete location. It is still associated with assets.");
        }

        locationRepository.deleteById(id);
    }
}
