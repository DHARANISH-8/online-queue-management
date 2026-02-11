package com.queue.backend.queue;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QueueRepository extends JpaRepository<QueueToken, Long> {
	List<QueueToken> findByStatusOrderByTokenNumberAsc(QueueStatus status);
	long countByStatus(QueueStatus status);
}

