package com.queue.backend.user.service;

import com.queue.backend.user.entity.User;
import com.queue.backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already taken");
        }
        // Self-registration is limited to patient accounts.
        user.setRole("CUSTOMER");
        user.setActive(true);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User loginUser(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (Boolean.FALSE.equals(user.getActive())) {
                throw new RuntimeException("Account is deactivated. Contact administrator.");
            }
            if (passwordEncoder.matches(password, user.getPassword())) {
                return user;
            }
        }
        throw new RuntimeException("Invalid credentials");
    }

    public List<User> getUsersByRole(String role) {
        return userRepository.findByRole(role);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(String name, String email, String phone, String role, String password) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }
        if (password == null || password.isBlank()) {
            throw new RuntimeException("Password is required");
        }
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already taken");
        }

        User user = new User(name, email, phone, normalizeRole(role));
        user.setPassword(passwordEncoder.encode(password));
        user.setActive(true);
        return userRepository.save(user);
    }

    public User updateUser(Long id, String name, String email, String phone, String role, String password) {
        if (id == null) {
            throw new RuntimeException("User ID is required");
        }
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        if (email != null && !email.isBlank() && !email.equalsIgnoreCase(user.getEmail())) {
            Optional<User> byEmail = userRepository.findByEmail(email);
            if (byEmail.isPresent() && !byEmail.get().getId().equals(id)) {
                throw new RuntimeException("Email already taken");
            }
            user.setEmail(email);
        }

        if (name != null && !name.isBlank()) {
            user.setName(name);
        }
        if (phone != null && !phone.isBlank()) {
            user.setPhone(phone);
        }
        if (role != null && !role.isBlank()) {
            user.setRole(normalizeRole(role));
        }
        if (password != null && !password.isBlank()) {
            user.setPassword(passwordEncoder.encode(password));
        }

        return userRepository.save(user);
    }

    public User setUserActiveStatus(Long id, boolean active) {
        if (id == null) {
            throw new RuntimeException("User ID is required");
        }
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(active);
        return userRepository.save(user);
    }

    private String normalizeRole(String role) {
        String normalized = role == null ? "" : role.trim().toUpperCase();
        if ("PATIENT".equals(normalized) || "USER".equals(normalized)) {
            return "CUSTOMER";
        }
        if ("ADMIN".equals(normalized) || "DOCTOR".equals(normalized) || "CUSTOMER".equals(normalized)
                || "STAFF".equals(normalized)) {
            return normalized;
        }
        throw new RuntimeException("Invalid role. Allowed: ADMIN, DOCTOR, PATIENT");
    }
}
