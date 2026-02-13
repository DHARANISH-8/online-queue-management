package com.queue.backend;

import com.queue.backend.user.entity.User;
import com.queue.backend.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DatabaseDiagnostic implements CommandLineRunner {

    private final UserRepository userRepository;

    public DatabaseDiagnostic(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("--- DATABASE DIAGNOSTIC START ---");
        List<User> users = userRepository.findAll();
        System.out.println("Total users found: " + users.size());
        for (User user : users) {
            System.out
                    .println("User: " + user.getName() + " | Email: " + user.getEmail() + " | Role: " + user.getRole());
        }
        System.out.println("--- DATABASE DIAGNOSTIC END ---");
    }
}
