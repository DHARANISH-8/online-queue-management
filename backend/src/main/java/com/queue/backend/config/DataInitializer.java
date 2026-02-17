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

            // Seed Doctor Members if not exist
            System.out.println("Checking for doctor members to seed...");
            seedDoctor(userRepository, passwordEncoder, "Dr John", "doctor1@qflow.com", "9876543210");
            seedDoctor(userRepository, passwordEncoder, "Dr Sarah", "doctor2@qflow.com", "9876543211");
            seedDoctor(userRepository, passwordEncoder, "Dr Robert", "doctor3@qflow.com", "9876543212");
            System.out.println("Seeding process completed.");
        };
    }

    private void seedDoctor(UserRepository userRepository, PasswordEncoder passwordEncoder, String name, String email,
            String phone) {
        if (!userRepository.existsByEmail(email)) {
            User doctor = new User(name, email, phone, "DOCTOR");
            doctor.setPassword(passwordEncoder.encode("doctor123"));
            userRepository.save(doctor);
            System.out.println("Doctor member seeded: " + name);
        }
    }
}
