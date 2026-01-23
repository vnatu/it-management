package com.cognologix.itmanagement.repository;

import com.cognologix.itmanagement.entity.TicketCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketCategoryRepository extends JpaRepository<TicketCategory, Long> {
}
