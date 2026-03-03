package com.queue.backend.counter.repository;

import com.queue.backend.counter.entity.Counter;
import com.queue.backend.counter.entity.CounterStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CounterRepository extends JpaRepository<Counter, Long> {

    List<Counter> findByStatus(CounterStatus status);
    List<Counter> findByStaffId(Long staffId);

}
