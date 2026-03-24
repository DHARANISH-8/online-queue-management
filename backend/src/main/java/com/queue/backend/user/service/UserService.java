package com.queue.backend.user.service;

import com.queue.backend.user.entity.User;
import com.queue.backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {
    private static final List<String> DOCTOR_ROLES = List.of("DOCTOR", "STAFF");
    private static final Map<String, String> SPECIALTY_LOOKUP = buildSpecialtyLookup();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already taken");
        }
        String normalizedRole = normalizeRole(user.getRole());
        user.setRole(normalizedRole);
        user.setSpecialty(normalizeSpecialtyForRole(normalizedRole, user.getSpecialty()));
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

    public User createUser(String name, String email, String phone, String role, String password, String specialty) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }
        if (password == null || password.isBlank()) {
            throw new RuntimeException("Password is required");
        }
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already taken");
        }

        String normalizedRole = normalizeRole(role);
        User user = new User(name, email, phone, normalizedRole);
        user.setSpecialty(normalizeSpecialtyForRole(normalizedRole, specialty));
        user.setPassword(passwordEncoder.encode(password));
        user.setActive(true);
        return userRepository.save(user);
    }

    public User updateUser(Long id, String name, String email, String phone, String role, String password, String specialty) {
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
        String effectiveRole = user.getRole();
        if (role != null && !role.isBlank()) {
            effectiveRole = normalizeRole(role);
            user.setRole(effectiveRole);
        }
        if (specialty != null || "DOCTOR".equalsIgnoreCase(effectiveRole) || "STAFF".equalsIgnoreCase(effectiveRole)) {
            user.setSpecialty(normalizeSpecialtyForRole(effectiveRole, specialty != null ? specialty : user.getSpecialty()));
        } else {
            user.setSpecialty(null);
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

    public List<User> getDoctorsBySpecialty(String specialty) {
        if (specialty == null || specialty.isBlank()) {
            return userRepository.findByRoleIn(DOCTOR_ROLES);
        }
        String normalizedSpecialty = normalizeSpecialty(specialty);
        return userRepository.findByRoleInAndSpecialtyIgnoreCase(DOCTOR_ROLES, normalizedSpecialty);
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

    private String normalizeSpecialtyForRole(String role, String specialty) {
        String normalizedRole = role == null ? "" : role.trim().toUpperCase();
        if (!"DOCTOR".equals(normalizedRole) && !"STAFF".equals(normalizedRole)) {
            return null;
        }
        return normalizeSpecialty(specialty);
    }

    private String normalizeSpecialty(String specialty) {
        String normalized = specialty == null ? "" : specialty.trim().toLowerCase();
        String canonical = SPECIALTY_LOOKUP.get(normalized);
        if (canonical == null) {
            throw new RuntimeException("Invalid specialty");
        }
        return canonical;
    }

    private static Map<String, String> buildSpecialtyLookup() {
        List<String> specialties = Arrays.asList(
                "General Medicine",
                "Cardiology",
                "Neurology",
                "Orthopedics",
                "Pediatrics",
                "Dermatology",
                "ENT",
                "Ophthalmology",
                "Gynecology",
                "Dentistry");
        Map<String, String> lookup = new LinkedHashMap<>();
        for (String specialty : specialties) {
            lookup.put(specialty.toLowerCase(), specialty);
        }
        return lookup;
    }
}
