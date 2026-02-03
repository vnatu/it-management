package com.cognologix.itmanagement.controller;

import com.cognologix.itmanagement.entity.Tag;
import com.cognologix.itmanagement.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class TagController {
    private final TagService tagService;

    @GetMapping
    public List<Tag> getAllTags(@RequestParam(required = false) Boolean isGroup) {
        if (Boolean.TRUE.equals(isGroup)) {
            return tagService.getGroupTags();
        }
        return tagService.getAllTags();
    }

    @PostMapping
    public Tag createTag(@RequestBody Tag tag) {
        return tagService.saveTag(tag);
    }

    @PutMapping("/{id}")
    public Tag updateTag(@PathVariable Long id, @RequestBody Tag tag) {
        tag.setId(id);
        return tagService.saveTag(tag);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }
}
