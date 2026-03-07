package com.queue.backend.counter.service;

import com.queue.backend.counter.entity.Counter;
import com.queue.backend.counter.entity.CounterStatus;
import com.queue.backend.counter.repository.CounterRepository;
import com.queue.backend.notification.service.EmailService;
import com.queue.backend.queue.QueueRepository;
import com.queue.backend.queue.QueueStatus;
import com.queue.backend.queue.QueueToken;
import com.queue.backend.user.entity.User;
import com.queue.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class CounterService {

    public record OpenCounterResult(Counter counter, int notifiedUsersCount) {
    }

    public record CounterSummary(
            Long id,
            String counterName,
            String serviceType,
            String status,
            Long doctorId,
            String doctorName,
            long assignedPatients,
            String currentServingToken) {
    }

    private final CounterRepository counterRepository;
    private final UserRepository userRepository;
    private final QueueRepository queueRepository;
    private final EmailService emailService;

    public CounterService(CounterRepository counterRepository,
            UserRepository userRepository,
            QueueRepository queueRepository,
            EmailService emailService) {
        this.counterRepository = counterRepository;
        this.userRepository = userRepository;
        this.queueRepository = queueRepository;
        this.emailService = emailService;
    }

    // Create new counter
    public Counter createCounter(String counterName, String serviceType, Long doctorId) {
        if (doctorId == null) {
            throw new RuntimeException("Doctor selection is required");
        }

        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        String role = doctor.getRole() == null ? "" : doctor.getRole().toUpperCase();
        if (!"DOCTOR".equals(role) && !"STAFF".equals(role)) {
            throw new RuntimeException("Selected user is not a doctor");
        }

        Counter counter = new Counter(
                counterName,
                serviceType,
                CounterStatus.CLOSED,
                doctor);

        return counterRepository.save(counter);
    }

    // Open counter
    public OpenCounterResult openCounter(Long counterId) {
        if (counterId == null) {
            throw new RuntimeException("Counter ID cannot be null");
        }

        Counter counter = counterRepository.findById(counterId)
                .orElseThrow(() -> new RuntimeException("Counter not found"));

        counter.setStatus(CounterStatus.OPEN);
        Counter savedCounter = counterRepository.save(counter);

        List<QueueToken> tokens = queueRepository.findByCounterId(counterId);
        Set<Long> notifiedUsers = new java.util.HashSet<>();
        for (QueueToken token : tokens) {
            if (token.getStatus() == QueueStatus.WAITING && token.getUser() != null && token.getUser().getId() != null) {
                Long userId = token.getUser().getId();
                if (notifiedUsers.add(userId)) {
                    emailService.sendCounterStarted(token.getUser(), savedCounter, token);
                }
            }
        }

        return new OpenCounterResult(savedCounter, notifiedUsers.size());
    }

    // Close counter
    public Counter closeCounter(Long counterId) {
        if (counterId == null) {
            throw new RuntimeException("Counter ID cannot be null");
        }

        Counter counter = counterRepository.findById(counterId)
                .orElseThrow(() -> new RuntimeException("Counter not found"));

        // Auto-cancel active tokens mapped to this counter when it is closed.
        List<QueueToken> tokens = queueRepository.findByCounterId(counterId);
        for (QueueToken token : tokens) {
            if (token.getStatus() == QueueStatus.WAITING
                    || token.getStatus() == QueueStatus.SERVED
                    || token.getStatus() == QueueStatus.IN_CONSULTATION) {
                token.setStatus(QueueStatus.CANCELLED);
                queueRepository.save(token);
            }
        }

        counter.setStatus(CounterStatus.CLOSED);
        return counterRepository.save(counter);
    }

    // Get all counters
    public List<Counter> getAllCounters() {
        return counterRepository.findAll();
    }

    public List<CounterSummary> getCounterSummaries() {
        return counterRepository.findAll().stream()
                .map(counter -> {
                    long assignedPatients = queueRepository.countByCounterIdAndStatusIn(
                            counter.getId(),
                            Set.of(QueueStatus.WAITING, QueueStatus.IN_CONSULTATION));
                    String currentServing = queueRepository.findFirstByCounterIdAndStatusInOrderByIdDesc(
                            counter.getId(),
                            Set.of(QueueStatus.IN_CONSULTATION, QueueStatus.SERVED))
                            .map(token -> counter.getCounterName() + "-" + String.format("%03d", token.getTokenNumber()))
                            .orElse("-");
                    Long doctorId = counter.getStaff() != null ? counter.getStaff().getId() : null;
                    String doctorName = counter.getStaff() != null ? counter.getStaff().getName() : null;
                    return new CounterSummary(
                            counter.getId(),
                            counter.getCounterName(),
                            counter.getServiceType(),
                            counter.getStatus().name(),
                            doctorId,
                            doctorName,
                            assignedPatients,
                            currentServing);
                })
                .toList();
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

        List<QueueToken> waitingTokens = queueRepository.findByCounterIdAndStatusOrderByTokenNumberAsc(counterId, QueueStatus.WAITING);

        if (waitingTokens.isEmpty()) {
            throw new RuntimeException("No waiting tokens");
        }

        QueueToken token = waitingTokens.get(0);

        token.setStatus(QueueStatus.IN_CONSULTATION);
        token.setCounter(counter);

        return queueRepository.save(token);
    }

    public Counter updateCounter(Long id, String counterName, String serviceType, Long doctorId) {
        if (id == null) {
            throw new RuntimeException("Counter ID cannot be null");
        }
        Counter counter = counterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Counter not found"));

        if (counterName != null && !counterName.isBlank()) {
            counter.setCounterName(counterName.trim());
        }
        if (serviceType != null && !serviceType.isBlank()) {
            counter.setServiceType(serviceType.trim());
        }

        if (doctorId != null) {
            User doctor = userRepository.findById(doctorId)
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));
            String role = doctor.getRole() == null ? "" : doctor.getRole().toUpperCase();
            if (!"DOCTOR".equals(role) && !"STAFF".equals(role)) {
                throw new RuntimeException("Selected user is not a doctor");
            }
            counter.setStaff(doctor);
        }

        return counterRepository.save(counter);
    }

    // Get unique service types - returns default services if no counters exist
    public List<String> getUniqueServiceTypes() {
        List<String> serviceTypes = counterRepository.findByStatus(CounterStatus.OPEN)
                .stream()
                .map(Counter::getServiceType)
                .filter(type -> type != null && !type.isBlank())
                .distinct()
                .toList();

        // Only expose services that currently have open counters.
        return serviceTypes;
    }

    // Delete counter
    public void deleteCounter(Long id) {
        if (id == null) {
            throw new RuntimeException("Counter ID cannot be null");
        }
        if (!counterRepository.existsById(id)) {
            throw new RuntimeException("Counter not found with ID: " + id);
        }

        // Cancel any active tokens from this counter so they disappear for users.
        List<QueueToken> tokens = queueRepository.findByCounterId(id);
        for (QueueToken token : tokens) {
            if (token.getStatus() == QueueStatus.WAITING
                    || token.getStatus() == QueueStatus.SERVED
                    || token.getStatus() == QueueStatus.IN_CONSULTATION) {
                token.setStatus(QueueStatus.CANCELLED);
            }
            token.setCounter(null);
            queueRepository.save(token);
        }

        counterRepository.deleteById(id);
    }
}
