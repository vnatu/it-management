package com.cognologix.itmanagement.repository;

import com.cognologix.itmanagement.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByName(String name);
    Optional<Location> findByCodeIgnoreCase(String code);

    List<Location> findByIsActiveTrue();
}
