package com.cognologix.itmanagement.service;

import com.cognologix.itmanagement.entity.TicketCategory;
import com.cognologix.itmanagement.repository.TicketCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketCategoryService {
    private final TicketCategoryRepository repository;

    public List<TicketCategory> getAllCategories() {
        return repository.findAll();
    }

    public TicketCategory saveCategory(TicketCategory category) {
        return repository.save(category);
    }
}
