package com.cognologix.itmanagement.controller;

import com.cognologix.itmanagement.entity.ImportJob;
import com.cognologix.itmanagement.service.AssetImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/import")
@RequiredArgsConstructor
public class ImportJobController {

    private final AssetImportService assetImportService;

    @PostMapping(value = "/assets", consumes = "multipart/form-data")
    public ResponseEntity<?> importAssets(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
            return ResponseEntity.badRequest().body("Only CSV files are accepted");
        }
        try {
            ImportJob job = assetImportService.submitImport(file);
            return ResponseEntity.status(HttpStatus.CREATED).body(job);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to start import: " + e.getMessage());
        }
    }

    @GetMapping("/jobs")
    public List<ImportJob> getAllJobs() {
        return assetImportService.getAllJobs();
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<ImportJob> getJob(@PathVariable Long id) {
        return assetImportService.getJob(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
