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

    @Override
    public void run(String... args) throws Exception {
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

        if (categoryRepository.count() == 0) {
            // Create IT Category
            AssetCategory itCategory = new AssetCategory();
            itCategory.setName("IT Assets");
            itCategory.setDescription("Devices like Laptops, Servers, etc.");
            itCategory.setType(CategoryType.IT);

            AssetAttributeDefinition ram = new AssetAttributeDefinition();
            ram.setName("RAM");
            ram.setDataType(AttributeDataType.TEXT);
            ram.setRequired(true);
            ram.setCategory(itCategory);

            AssetAttributeDefinition cpu = new AssetAttributeDefinition();
            cpu.setName("CPU");
            cpu.setDataType(AttributeDataType.TEXT);
            cpu.setRequired(true);
            cpu.setCategory(itCategory);

            itCategory.setAttributeDefinitions(List.of(ram, cpu));
            categoryRepository.save(itCategory);

            // Create Type
            AssetType laptop = new AssetType();
            laptop.setName("Laptop");
            laptop.setCategory(itCategory);
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
    }
}
