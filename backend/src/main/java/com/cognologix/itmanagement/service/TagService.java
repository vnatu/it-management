package com.cognologix.itmanagement.service;

import com.cognologix.itmanagement.entity.Tag;
import com.cognologix.itmanagement.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TagService {
    private final TagRepository tagRepository;

    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    public List<Tag> getGroupTags() {
        return tagRepository.findByIsGroupTagTrue();
    }

    public Optional<Tag> getTagById(Long id) {
        return tagRepository.findById(id);
    }

    public Tag saveTag(Tag tag) {
        return tagRepository.save(tag);
    }

    public void deleteTag(Long id) {
        tagRepository.deleteById(id);
    }
}
