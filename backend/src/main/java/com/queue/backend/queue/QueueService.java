package com.queue.backend.queue;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import com.queue.backend.counter.entity.Counter;
import com.queue.backend.counter.entity.CounterStatus;
import com.queue.backend.counter.repository.CounterRepository;
import com.queue.backend.user.entity.User;
import com.queue.backend.user.repository.UserRepository;

@Service
public class QueueService {

    private final QueueRepository queueRepository;
    private final UserRepository userRepository;
    private final CounterRepository counterRepository;

    public QueueService(QueueRepository queueRepository,
            UserRepository userRepository,
            CounterRepository counterRepository) {
        this.queueRepository = queueRepository;
        this.userRepository = userRepository;
        this.counterRepository = counterRepository;
    }

    // ✅ Generate Token (AUTO INCREMENT SAFE)
    public QueueToken generateToken(Long userId, String serviceType, Long doctorId, Long counterId) {

        if (userId == null) {
            throw new RuntimeException("User ID cannot be null");
        }

        // Fetch user from DB
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Counter> openCounters = counterRepository.findByStatus(CounterStatus.OPEN);
        if (openCounters.isEmpty()) {
            throw new RuntimeException("No open counters available. Please wait for admin to open a counter.");
        }

        Counter selectedCounter;
        if (counterId != null) {
            selectedCounter = openCounters.stream()
                    .filter(counter -> counter.getId().equals(counterId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Selected counter is not open."));
        } else {
            selectedCounter = openCounters.stream()
                    .filter(counter -> counter.getServiceType() != null
                            && counter.getServiceType().equalsIgnoreCase(serviceType))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Selected service is not available right now. Please choose an open service."));
        }

        if (doctorId != null) {
            User doctor = userRepository.findById(doctorId)
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));
            String role = doctor.getRole() == null ? "" : doctor.getRole().toUpperCase();
            if (!"DOCTOR".equals(role) && !"STAFF".equals(role)) {
                throw new RuntimeException("Selected user is not a doctor");
            }
        }

        // Token sequence is per counter, so it resets for each counter.
        Optional<QueueToken> lastTokenOpt = queueRepository.findFirstByCounterIdOrderByTokenNumberDesc(selectedCounter.getId());

        int nextToken = lastTokenOpt.isPresent() ? lastTokenOpt.get().getTokenNumber() + 1 : 1;

        QueueToken token = new QueueToken(
                nextToken,
                QueueStatus.WAITING,
                user,
                serviceType);
        token.setCounter(selectedCounter);

        return queueRepository.save(token);
    }

    // ✅ Get active token for user
    public Optional<QueueToken> getActiveTokenForUser(Long userId) {
        return queueRepository.findByStatusOrderByTokenNumberAsc(QueueStatus.WAITING)
                .stream()
                .filter(t -> t.getUser().getId().equals(userId))
                .findFirst();
    }

    // ✅ Get waiting queue
    public List<QueueToken> getWaitingQueue() {
        return queueRepository
                .findByStatusOrderByTokenNumberAsc(QueueStatus.WAITING);
    }

    // ✅ Serve next token
    public QueueToken serveNext() {

        List<QueueToken> waitingList = queueRepository.findByStatusOrderByTokenNumberAsc(QueueStatus.WAITING);

        if (waitingList.isEmpty()) {
            return null;
        }

        QueueToken token = waitingList.get(0);
        token.setStatus(QueueStatus.SERVED);

        return queueRepository.save(token);
    }

    // ✅ Get token by ID
    public QueueToken getTokenById(Long tokenId) {
        if (tokenId == null) {
            throw new RuntimeException("Token ID cannot be null");
        }
        return queueRepository.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("Token not found with ID: " + tokenId));
    }

    // ✅ Update token status by ID
    public QueueToken updateTokenStatus(Long tokenId, QueueStatus newStatus) {
        if (tokenId == null) {
            throw new RuntimeException("Token ID cannot be null");
        }
        QueueToken token = queueRepository.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("Token not found with ID: " + tokenId));

        token.setStatus(newStatus);
        return queueRepository.save(token);
    }

    // ✅ Get queue count by status
    public long getQueueCountByStatus(QueueStatus status) {
        return queueRepository.countByStatus(status);
    }
}
