package com.queue.backend.queue;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QueueRepository extends JpaRepository<QueueToken, Long> {

    List<QueueToken> findByStatusOrderByTokenNumberAsc(QueueStatus status);

    long countByStatus(QueueStatus status);

    Optional<QueueToken> findFirstByOrderByTokenNumberDesc();
}
