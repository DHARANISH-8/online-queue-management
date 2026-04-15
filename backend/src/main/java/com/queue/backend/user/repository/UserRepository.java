package com.queue.backend.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;
import com.queue.backend.user.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // 🔐 Login
    Optional<User> findByEmailIgnoreCase(String email);

    // ✅ Validation
    boolean existsByEmailIgnoreCase(String email);

    // 👥 Role-based queries
    List<User> findByRole(String role);

    List<User> findByRoleIn(List<String> roles);

    List<User> findByRoleInAndSpecialtyIgnoreCase(List<String> roles, String specialty);
}