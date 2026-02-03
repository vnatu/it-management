package com.cognologix.itmanagement.repository;

import com.cognologix.itmanagement.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findByName(String name);

    List<Tag> findByIsGroupTagTrue();
}
