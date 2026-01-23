package com.cognologix.itmanagement.controller;

import com.cognologix.itmanagement.entity.TicketCategory;
import com.cognologix.itmanagement.service.TicketCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ticket-categories")
@RequiredArgsConstructor
public class TicketCategoryController {
    private final TicketCategoryService ticketCategoryService;

    @GetMapping
    public List<TicketCategory> getAllCategories() {
        return ticketCategoryService.getAllCategories();
    }
}
