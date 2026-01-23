package com.cognologix.itmanagement.service;

import com.cognologix.itmanagement.entity.TicketComment;
import com.cognologix.itmanagement.repository.TicketCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketCommentService {
    private final TicketCommentRepository repository;

    public List<TicketComment> getCommentsByTicketId(Long ticketId) {
        return repository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public TicketComment saveComment(TicketComment comment) {
        return repository.save(comment);
    }
}
