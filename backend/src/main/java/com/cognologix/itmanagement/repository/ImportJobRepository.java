package com.cognologix.itmanagement.repository;

import com.cognologix.itmanagement.entity.ImportJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImportJobRepository extends JpaRepository<ImportJob, Long> {
    List<ImportJob> findAllByOrderByCreatedAtDesc();
}
