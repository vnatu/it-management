package com.cognologix.itmanagement.service;

import com.cognologix.itmanagement.entity.*;
import com.cognologix.itmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AssetImportService {

    private static final int MAX_ERROR_ENTRIES = 100;

    private final ImportJobRepository importJobRepository;
    private final AssetRepository assetRepository;
    private final AssetTypeRepository assetTypeRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final AssetHistoryService assetHistoryService;

    public ImportJob submitImport(MultipartFile file) throws Exception {
        ImportJob job = new ImportJob();
        job.setFileName(file.getOriginalFilename());
        job.setStatus(ImportJobStatus.PENDING);
        job = importJobRepository.save(job);

        processImportAsync(job.getId(), file.getBytes());
        return job;
    }

    @Async("importTaskExecutor")
    public void processImportAsync(Long jobId, byte[] csvBytes) {
        ImportJob job = importJobRepository.findById(jobId).orElseThrow();
        job.setStatus(ImportJobStatus.PROCESSING);
        job.setStartedAt(LocalDateTime.now());
        importJobRepository.save(job);

        List<Map<String, String>> errors = new ArrayList<>();
        int successCount = 0;
        int rowNumber = 0;

        try {
            Reader reader = new InputStreamReader(new java.io.ByteArrayInputStream(csvBytes), StandardCharsets.UTF_8);
            CSVParser parser = CSVFormat.DEFAULT
                    .builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setTrim(true)
                    .setIgnoreEmptyLines(true)
                    .build()
                    .parse(reader);

            List<CSVRecord> records = new ArrayList<>();
            for (CSVRecord record : parser) {
                String firstCell = getCell(record, "asset_custom_id");
                // Skip guidelines/instructions row (prefixed with #)
                if (firstCell.startsWith("#")) {
                    continue;
                }
                records.add(record);
            }

            job.setTotalRows(records.size());
            importJobRepository.save(job);

            for (CSVRecord record : records) {
                rowNumber++;
                try {
                    processRow(record, rowNumber);
                    successCount++;
                } catch (Exception e) {
                    log.warn("Import row {} failed: {}", rowNumber, e.getMessage());
                    if (errors.size() < MAX_ERROR_ENTRIES) {
                        Map<String, String> err = new LinkedHashMap<>();
                        err.put("row", String.valueOf(rowNumber));
                        err.put("message", e.getMessage());
                        errors.add(err);
                    }
                }

                // Flush progress every 10 rows
                if (rowNumber % 10 == 0) {
                    job.setProcessedRows(rowNumber);
                    job.setSuccessCount(successCount);
                    job.setFailureCount(rowNumber - successCount);
                    importJobRepository.save(job);
                }
            }

            job.setProcessedRows(rowNumber);
            job.setSuccessCount(successCount);
            job.setFailureCount(rowNumber - successCount);
            job.setErrorDetails(serializeErrors(errors));
            job.setCompletedAt(LocalDateTime.now());
            job.setStatus(errors.isEmpty() ? ImportJobStatus.COMPLETED : ImportJobStatus.COMPLETED_WITH_ERRORS);

        } catch (Exception e) {
            log.error("Import job {} failed with unexpected error", jobId, e);
            job.setProcessedRows(rowNumber);
            job.setSuccessCount(successCount);
            job.setFailureCount(rowNumber - successCount);
            job.setCompletedAt(LocalDateTime.now());
            job.setStatus(ImportJobStatus.FAILED);

            Map<String, String> fatalErr = new LinkedHashMap<>();
            fatalErr.put("row", "N/A");
            fatalErr.put("message", "Fatal error: " + e.getMessage());
            errors.add(fatalErr);
            job.setErrorDetails(serializeErrors(errors));
        }

        importJobRepository.save(job);
    }

    private void processRow(CSVRecord record, int rowNumber) {
        String typeName = required(getCell(record, "type"), "type", rowNumber);
        String brand = required(getCell(record, "brand"), "brand", rowNumber);
        String modelNo = required(getCell(record, "model_no"), "model_no", rowNumber);
        String statusStr = required(getCell(record, "status"), "status", rowNumber);

        AssetType assetType = assetTypeRepository.findByNameIgnoreCase(typeName)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Row " + rowNumber + ": Asset type '" + typeName + "' not found"));

        AssetStatus status;
        try {
            status = AssetStatus.valueOf(statusStr.toUpperCase().replace(" ", "_"));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Row " + rowNumber + ": Invalid status '" + statusStr + "'. Valid values: "
                            + Arrays.toString(AssetStatus.values()));
        }

        Asset asset = new Asset();

        String customId = getCell(record, "asset_custom_id");
        if (!customId.isBlank()) {
            asset.setAssetCustomId(customId);
        } else {
            asset.setAssetCustomId(generateCustomId());
        }

        asset.setType(assetType);
        asset.setBrand(brand);
        asset.setModelNo(modelNo);
        asset.setStatus(status);
        asset.setSerialNo(getCell(record, "serial_no"));
        asset.setSku(getCell(record, "sku"));
        asset.setColor(getCell(record, "color"));
        asset.setVendorInfo(getCell(record, "vendor_info"));
        asset.setDescription(getCell(record, "description"));

        String priceStr = getCell(record, "price");
        if (!priceStr.isBlank()) {
            try {
                asset.setPrice(new BigDecimal(priceStr.replace(",", "")));
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Row " + rowNumber + ": Invalid price '" + priceStr + "'");
            }
        }

        asset.setPurchaseDate(parseDate(getCell(record, "purchase_date"), "purchase_date", rowNumber));
        asset.setWarrantyStart(parseDate(getCell(record, "warranty_start"), "warranty_start", rowNumber));
        asset.setWarrantyEnd(parseDate(getCell(record, "warranty_end"), "warranty_end", rowNumber));

        String locationCode = getCell(record, "location_code");
        if (!locationCode.isBlank()) {
            Location location = locationRepository.findByCodeIgnoreCase(locationCode)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Row " + rowNumber + ": Location code '" + locationCode + "' not found"));
            asset.setLocation(location);
        }

        String userEmail = getCell(record, "assigned_to_email");
        if (!userEmail.isBlank()) {
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Row " + rowNumber + ": User with email '" + userEmail + "' not found"));
            asset.setAssignedTo(user);
        }

        String tagsRaw = getCell(record, "tags");
        if (!tagsRaw.isBlank()) {
            Set<Tag> tags = new HashSet<>();
            for (String tagName : tagsRaw.split("\\|")) {
                String trimmed = tagName.trim();
                if (!trimmed.isEmpty()) {
                    tagRepository.findByName(trimmed).ifPresent(tags::add);
                }
            }
            asset.setTags(tags);
        }

        Asset saved = assetRepository.save(asset);
        assetHistoryService.logChange(saved, "CREATED", "Bulk import", null, null);
    }

    public Optional<ImportJob> getJob(Long id) {
        return importJobRepository.findById(id);
    }

    public List<ImportJob> getAllJobs() {
        return importJobRepository.findAllByOrderByCreatedAtDesc();
    }

    // --- helpers ---

    private String getCell(CSVRecord record, String column) {
        try {
            String val = record.get(column);
            return val == null ? "" : val.trim();
        } catch (IllegalArgumentException e) {
            return "";
        }
    }

    private String required(String value, String field, int rowNumber) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Row " + rowNumber + ": '" + field + "' is required");
        }
        return value;
    }

    private LocalDate parseDate(String value, String field, int rowNumber) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException(
                    "Row " + rowNumber + ": Invalid date format for '" + field + "' (expected YYYY-MM-DD): " + value);
        }
    }

    private String generateCustomId() {
        return "ASSET-" + System.currentTimeMillis();
    }

    private String serializeErrors(List<Map<String, String>> errors) {
        if (errors.isEmpty()) return null;
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < errors.size(); i++) {
            Map<String, String> err = errors.get(i);
            sb.append("{\"row\":\"").append(err.get("row")).append("\",")
              .append("\"message\":\"").append(escapeJson(err.get("message"))).append("\"}");
            if (i < errors.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}
