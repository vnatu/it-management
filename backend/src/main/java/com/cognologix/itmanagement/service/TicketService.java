package com.cognologix.itmanagement.service;

import com.cognologix.itmanagement.entity.Ticket;
import com.cognologix.itmanagement.entity.TicketPriority;
import com.cognologix.itmanagement.entity.TicketStatus;
import com.cognologix.itmanagement.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Optional<Ticket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }

    public Ticket saveTicket(Ticket ticket) {
        if (ticket.getTicketNo() == null) {
            ticket.setTicketNo("TKT-" + (System.currentTimeMillis() % 1000000));
        }
        if (ticket.getStatus() == null) {
            ticket.setStatus(TicketStatus.PENDING);
        }
        if (ticket.getPriority() == null) {
            ticket.setPriority(TicketPriority.MEDIUM);
        }
        return ticketRepository.save(ticket);
    }
}
