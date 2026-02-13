package com.queue.backend.counter.service;

import com.queue.backend.counter.entity.Counter;
import com.queue.backend.counter.entity.CounterStatus;
import com.queue.backend.counter.repository.CounterRepository;
import com.queue.backend.queue.QueueRepository;
import com.queue.backend.queue.QueueStatus;
import com.queue.backend.queue.QueueToken;
import com.queue.backend.user.entity.User;
import com.queue.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CounterService {

    private final CounterRepository counterRepository;
    private final UserRepository userRepository;
    private final QueueRepository queueRepository;

    public CounterService(CounterRepository counterRepository,
            UserRepository userRepository,
            QueueRepository queueRepository) {
        this.counterRepository = counterRepository;
        this.userRepository = userRepository;
        this.queueRepository = queueRepository;
    }

    // Create new counter
    public Counter createCounter(String counterName, String serviceType, Long staffId) {
        if (staffId == null) {
            throw new RuntimeException("Staff ID cannot be null");
        }

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        Counter counter = new Counter(
                counterName,
                serviceType,
                CounterStatus.CLOSED,
                staff);

        return counterRepository.save(counter);
    }

    // Open counter
    public Counter openCounter(Long counterId) {
        if (counterId == null) {
            throw new RuntimeException("Counter ID cannot be null");
        }

        Counter counter = counterRepository.findById(counterId)
                .orElseThrow(() -> new RuntimeException("Counter not found"));

        counter.setStatus(CounterStatus.OPEN);
        return counterRepository.save(counter);
    }

    // Close counter
    public Counter closeCounter(Long counterId) {
        if (counterId == null) {
            throw new RuntimeException("Counter ID cannot be null");
        }

        Counter counter = counterRepository.findById(counterId)
                .orElseThrow(() -> new RuntimeException("Counter not found"));

        counter.setStatus(CounterStatus.CLOSED);
        return counterRepository.save(counter);
    }

    // Get all counters
    public List<Counter> getAllCounters() {
        return counterRepository.findAll();
    }

    // Get only open counters
    public List<Counter> getOpenCounters() {
        return counterRepository.findByStatus(CounterStatus.OPEN);
    }

    // Serve next token
    public QueueToken serveNextToken(Long counterId) {

        if (counterId == null) {
            throw new RuntimeException("Counter ID cannot be null");
        }

        Counter counter = counterRepository.findById(counterId)
                .orElseThrow(() -> new RuntimeException("Counter not found"));

        if (counter.getStatus() != CounterStatus.OPEN) {
            throw new RuntimeException("Counter is not open");
        }

        List<QueueToken> waitingTokens = queueRepository.findByStatusOrderByTokenNumberAsc(QueueStatus.WAITING);

        if (waitingTokens.isEmpty()) {
            throw new RuntimeException("No waiting tokens");
        }

        QueueToken token = waitingTokens.get(0);

        token.setStatus(QueueStatus.SERVED);
        token.setCounter(counter);

        return queueRepository.save(token);
    }

    // Get unique service types
    public List<String> getUniqueServiceTypes() {
        return counterRepository.findAll()
                .stream()
                .map(Counter::getServiceType)
                .distinct()
                .toList();
    }

    // Delete counter
    public void deleteCounter(Long id) {
        if (id == null) {
            throw new RuntimeException("Counter ID cannot be null");
        }
        if (!counterRepository.existsById(id)) {
            throw new RuntimeException("Counter not found with ID: " + id);
        }
        counterRepository.deleteById(id);
    }
}
