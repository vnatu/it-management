package com.cognologix.itmanagement.controller;

import com.cognologix.itmanagement.entity.TicketComment;
import com.cognologix.itmanagement.service.TicketCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
@RequiredArgsConstructor
public class TicketCommentController {
    private final TicketCommentService ticketCommentService;

    @GetMapping
    public List<TicketComment> getComments(@PathVariable Long ticketId) {
        return ticketCommentService.getCommentsByTicketId(ticketId);
    }

    @PostMapping
    public TicketComment addComment(@PathVariable Long ticketId, @RequestBody TicketComment comment) {
        // Validation and ticket association would go here in a full app
        return ticketCommentService.saveComment(comment);
    }
}
