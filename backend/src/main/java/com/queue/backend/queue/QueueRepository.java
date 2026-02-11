package com.queue.backend.queue;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface QueueRepository extends JpaRepository<QueueToken, Long> {

    List<QueueToken> findByStatusOrderByTokenNumberAsc(QueueStatus status);

    long countByStatus(QueueStatus status);

    Optional<QueueToken> findFirstByOrderByTokenNumberDesc();
}
