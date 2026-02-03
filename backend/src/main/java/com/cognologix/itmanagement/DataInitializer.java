package com.cognologix.itmanagement;

import com.cognologix.itmanagement.entity.*;
import com.cognologix.itmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AssetCategoryRepository categoryRepository;
    private final AssetTypeRepository typeRepository;
    private final UserRepository userRepository;
    private final TicketCategoryRepository ticketCategoryRepository;
    private final LocationRepository locationRepository;
    private final AssetRepository assetRepository;
    private final TagRepository tagRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Tickets
        if (ticketCategoryRepository.count() == 0) {
            TicketCategory hardware = new TicketCategory();
            hardware.setName("Hardware Issue");
            hardware.setDescription("Issues related to physical hardware");
            ticketCategoryRepository.save(hardware);

            TicketCategory software = new TicketCategory();
            software.setName("Software Issue");
            software.setDescription("Issues related to software/OS");
            ticketCategoryRepository.save(software);

            TicketCategory access = new TicketCategory();
            access.setName("Access Request");
            access.setDescription("Requests for account or folder access");
            ticketCategoryRepository.save(access);
        }

        // 2. Seed Users
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setEmail("admin@cognologix.com");
            admin.setFullName("Admin User");
            admin.setRole(UserRole.ADMIN);
            admin.setDepartment("IT");
            userRepository.save(admin);

            User manager = new User();
            manager.setEmail("manager@cognologix.com");
            manager.setFullName("IT Manager");
            manager.setRole(UserRole.RESTRICTED_ADMIN);
            manager.setDepartment("IT");
            userRepository.save(manager);

            User staff = new User();
            staff.setEmail("staff@cognologix.com");
            staff.setFullName("Regular Staff");
            staff.setRole(UserRole.USER);
            staff.setDepartment("Finance");
            userRepository.save(staff);
        }

        // 3. Seed Locations
        if (locationRepository.count() == 0) {
            Location hq = new Location();
            hq.setName("Mumbai HQ");
            hq.setCode("MUM-01");
            hq.setAddress("Cognologix, Mumbai, India");
            locationRepository.save(hq);

            Location london = new Location();
            london.setName("London Office");
            london.setCode("LON-01");
            london.setAddress("London, UK");
            locationRepository.save(london);

            Location remote = new Location();
            remote.setName("Remote");
            remote.setCode("REMOTE");
            remote.setAddress("Remote / WFH");
            locationRepository.save(remote);
        }

        // 4. Data Migration: Migrate string locations to entities
        migrateAssetLocations();

        // 5. Seed Asset Categories and Types
        if (categoryRepository.count() == 0) {
            // Create IT Category
            AssetCategory itCategory = new AssetCategory();
            itCategory.setName("IT Assets");
            itCategory.setDescription("Devices like Laptops, Servers, etc.");
            itCategory.setType(CategoryType.IT);

            categoryRepository.save(itCategory);

            // Create Type
            AssetType laptop = new AssetType();
            laptop.setName("Laptop");
            laptop.setCategory(itCategory);

            AssetAttributeDefinition ram = new AssetAttributeDefinition();
            ram.setName("RAM");
            ram.setDataType(AttributeDataType.TEXT);
            ram.setRequired(true);
            ram.setSection(AttributeSection.COMMON);
            ram.setAssetType(laptop);

            AssetAttributeDefinition cpu = new AssetAttributeDefinition();
            cpu.setName("CPU");
            cpu.setDataType(AttributeDataType.TEXT);
            cpu.setRequired(true);
            cpu.setSection(AttributeSection.COMMON);
            cpu.setAssetType(laptop);

            laptop.setAttributeDefinitions(List.of(ram, cpu));
            typeRepository.save(laptop);

            // Create Non-IT Category
            AssetCategory nonItCategory = new AssetCategory();
            nonItCategory.setName("Non-IT Assets");
            nonItCategory.setDescription("Furniture and general items");
            nonItCategory.setType(CategoryType.NON_IT);
            categoryRepository.save(nonItCategory);

            AssetType chair = new AssetType();
            chair.setName("Chair");
            chair.setCategory(nonItCategory);
            typeRepository.save(chair);
        }

        // Add Hardware category and types if missing
        if (categoryRepository.findByName("Hardware").isEmpty()) {
            AssetCategory hardwareCategory = new AssetCategory();
            hardwareCategory.setName("Hardware");
            hardwareCategory.setDescription("General hardware assets");
            hardwareCategory.setType(CategoryType.IT);
            categoryRepository.save(hardwareCategory);

            List<String> types = List.of("Laptop", "Desktop", "Headphone", "Mouse", "Monitor", "Charger");
            for (String typeName : types) {
                AssetType type = new AssetType();
                type.setName(typeName);
                type.setCategory(hardwareCategory);
                typeRepository.save(type);
            }
        }

        // 6. Seed and Link Tags
        seedAndLinkTags();
    }

    private void migrateAssetLocations() {
        List<Asset> assets = assetRepository.findAll();
        for (Asset asset : assets) {
            // Check if it has an old location string but no structured location entity
            if (asset.getOldLocation() != null && !asset.getOldLocation().trim().isEmpty()
                    && asset.getLocation() == null) {
                String locName = asset.getOldLocation().trim();

                Location location = locationRepository.findByName(locName)
                        .orElseGet(() -> {
                            Location newLoc = new Location();
                            newLoc.setName(locName);
                            // Generate a simple code if it doesn't exist
                            newLoc.setCode(locName.toUpperCase().replaceAll("\\s+", "_"));
                            return locationRepository.save(newLoc);
                        });

                asset.setLocation(location);
                // We keep oldLocation for now to be safe, but link established
                assetRepository.save(asset);
            }
        }
    }

    private void seedAndLinkTags() {
        if (tagRepository.count() == 0) {
            Tag fixed = new Tag(null, "Fixed", "#3B82F6", true, true);
            Tag mobile = new Tag(null, "Mobile", "#10B981", true, true);
            Tag license = new Tag(null, "License", "#F59E0B", true, true);
            Tag cloud = new Tag(null, "Cloud", "#8B5CF6", true, true);

            tagRepository.saveAll(java.util.List.of(fixed, mobile, license, cloud));

            // Link existing categories to these tags
            categoryRepository.findByName("IT Assets").ifPresent(cat -> {
                cat.getTags().add(fixed);
                categoryRepository.save(cat);
            });

            categoryRepository.findByName("Hardware").ifPresent(cat -> {
                cat.getTags().add(fixed);
                categoryRepository.save(cat);
            });

            categoryRepository.findByName("Non-IT Assets").ifPresent(cat -> {
                cat.getTags().add(fixed);
                categoryRepository.save(cat);
            });
        }
    }
}
