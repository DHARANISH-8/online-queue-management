package com.queue.backend.config;

import com.queue.backend.user.entity.User;
import com.queue.backend.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Admin if not exists
            if (!userRepository.existsByEmail("admin@qflow.com")) {
                User admin = new User("System Admin", "admin@qflow.com", "1234567890", "ADMIN");
                admin.setPassword(passwordEncoder.encode("admin123"));
                userRepository.save(admin);
                System.out.println("Admin user seeded.");
            }

            // Seed Staff Members if not exist
            System.out.println("Checking for staff members to seed...");
            seedStaff(userRepository, passwordEncoder, "John Staff", "staff1@qflow.com", "9876543210");
            seedStaff(userRepository, passwordEncoder, "Sarah Staff", "staff2@qflow.com", "9876543211");
            seedStaff(userRepository, passwordEncoder, "Robert Staff", "staff3@qflow.com", "9876543212");
            System.out.println("Seeding process completed.");
        };
    }

    private void seedStaff(UserRepository userRepository, PasswordEncoder passwordEncoder, String name, String email,
            String phone) {
        if (!userRepository.existsByEmail(email)) {
            User staff = new User(name, email, phone, "STAFF");
            staff.setPassword(passwordEncoder.encode("staff123"));
            userRepository.save(staff);
            System.out.println("Staff member seeded: " + name);
        }
    }
}
