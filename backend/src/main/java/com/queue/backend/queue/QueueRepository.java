package com.queue.backend.queue;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.Collection;

@Repository
public interface QueueRepository extends JpaRepository<QueueToken, Long> {

    List<QueueToken> findByStatusOrderByTokenNumberAsc(QueueStatus status);

    List<QueueToken> findByCounterId(Long counterId);

    long countByStatus(QueueStatus status);

    Optional<QueueToken> findFirstByOrderByTokenNumberDesc();

    Optional<QueueToken> findFirstByCounterIdOrderByTokenNumberDesc(Long counterId);

    List<QueueToken> findByCounterStaffIdAndStatusOrderByIdAsc(Long doctorId, QueueStatus status);

    Optional<QueueToken> findFirstByCounterStaffIdAndStatusInOrderByIdAsc(Long doctorId, Collection<QueueStatus> statuses);

    long countByCounterStaffIdAndStatus(Long doctorId, QueueStatus status);
}
