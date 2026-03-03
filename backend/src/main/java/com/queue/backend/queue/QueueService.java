package com.queue.backend.queue;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import com.queue.backend.counter.entity.Counter;
import com.queue.backend.counter.entity.CounterStatus;
import com.queue.backend.counter.repository.CounterRepository;
import com.queue.backend.notification.service.EmailService;
import com.queue.backend.user.entity.User;
import com.queue.backend.user.repository.UserRepository;

@Service
public class QueueService {
    public record StartQueueResult(int openedCounters, int notifiedUsers) {
    }

    private final QueueRepository queueRepository;
    private final UserRepository userRepository;
    private final CounterRepository counterRepository;
    private final EmailService emailService;

    public QueueService(QueueRepository queueRepository,
            UserRepository userRepository,
            CounterRepository counterRepository,
            EmailService emailService) {
        this.queueRepository = queueRepository;
        this.userRepository = userRepository;
        this.counterRepository = counterRepository;
        this.emailService = emailService;
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
        if (doctorId != null) {
            User doctor = userRepository.findById(doctorId)
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));
            String role = doctor.getRole() == null ? "" : doctor.getRole().toUpperCase();
            if (!"DOCTOR".equals(role) && !"STAFF".equals(role)) {
                throw new RuntimeException("Selected user is not a doctor");
            }

            List<Counter> doctorOpenCounters = openCounters.stream()
                    .filter(counter -> counter.getStaff() != null && doctorId.equals(counter.getStaff().getId()))
                    .toList();
            if (doctorOpenCounters.isEmpty()) {
                throw new RuntimeException("Selected doctor has no open counter.");
            }

            if (counterId != null) {
                selectedCounter = doctorOpenCounters.stream()
                        .filter(counter -> counter.getId().equals(counterId))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Selected counter does not belong to this doctor or is not open."));
            } else if (serviceType != null && !serviceType.isBlank()) {
                selectedCounter = doctorOpenCounters.stream()
                        .filter(counter -> counter.getServiceType() != null
                                && counter.getServiceType().equalsIgnoreCase(serviceType))
                        .findFirst()
                        .orElse(doctorOpenCounters.get(0));
            } else {
                selectedCounter = doctorOpenCounters.get(0);
            }
        } else if (counterId != null) {
            selectedCounter = openCounters.stream()
                    .filter(counter -> counter.getId().equals(counterId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Selected counter is not open."));
        } else {
            selectedCounter = openCounters.stream()
                    .filter(counter -> counter.getServiceType() != null
                            && counter.getServiceType().equalsIgnoreCase(serviceType))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException(
                            "Selected service is not available right now. Please choose an open service."));
        }

        // Token sequence is per counter, so it resets for each counter.
        Optional<QueueToken> lastTokenOpt = queueRepository.findFirstByCounterIdOrderByTokenNumberDesc(selectedCounter.getId());

        int nextToken = lastTokenOpt.isPresent() ? lastTokenOpt.get().getTokenNumber() + 1 : 1;

        QueueToken token = new QueueToken(
                nextToken,
                QueueStatus.WAITING,
                user,
                (serviceType == null || serviceType.isBlank()) ? selectedCounter.getServiceType() : serviceType);
        token.setCounter(selectedCounter);

        QueueToken savedToken = queueRepository.save(token);
        emailService.sendAppointmentBookingSuccess(user, savedToken);
        return savedToken;
    }

    // ✅ Get active token for user
    public Optional<QueueToken> getActiveTokenForUser(Long userId) {
        Set<QueueStatus> activeStatuses = Set.of(QueueStatus.WAITING, QueueStatus.IN_CONSULTATION, QueueStatus.SERVED);
        return queueRepository.findAll()
                .stream()
                .filter(t -> activeStatuses.contains(t.getStatus()))
                .filter(t -> t.getUser().getId().equals(userId))
                .sorted((a, b) -> Long.compare(a.getId(), b.getId()))
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

    public Optional<QueueToken> getCurrentConsultationForDoctor(Long doctorId) {
        if (doctorId == null) {
            throw new RuntimeException("Doctor ID cannot be null");
        }
        return queueRepository.findFirstByCounterStaffIdAndStatusInOrderByIdAsc(
                doctorId,
                Set.of(QueueStatus.IN_CONSULTATION, QueueStatus.SERVED));
    }

    public List<QueueToken> getWaitingQueueForDoctor(Long doctorId) {
        if (doctorId == null) {
            throw new RuntimeException("Doctor ID cannot be null");
        }
        return queueRepository.findByCounterStaffIdAndStatusOrderByIdAsc(doctorId, QueueStatus.WAITING);
    }

    public long getWaitingCountForDoctor(Long doctorId) {
        if (doctorId == null) {
            throw new RuntimeException("Doctor ID cannot be null");
        }
        return queueRepository.countByCounterStaffIdAndStatus(doctorId, QueueStatus.WAITING);
    }

    public QueueToken callNextForDoctor(Long doctorId) {
        if (doctorId == null) {
            throw new RuntimeException("Doctor ID cannot be null");
        }

        Optional<QueueToken> current = getCurrentConsultationForDoctor(doctorId);
        if (current.isPresent()) {
            throw new RuntimeException("Current consultation is already in progress.");
        }

        List<QueueToken> waitingTokens = getWaitingQueueForDoctor(doctorId);
        if (waitingTokens.isEmpty()) {
            throw new RuntimeException("No waiting patients in your queue.");
        }

        QueueToken nextToken = waitingTokens.get(0);
        nextToken.setStatus(QueueStatus.IN_CONSULTATION);
        return queueRepository.save(nextToken);
    }

    public QueueToken completeCurrentConsultationForDoctor(Long doctorId) {
        if (doctorId == null) {
            throw new RuntimeException("Doctor ID cannot be null");
        }

        QueueToken current = getCurrentConsultationForDoctor(doctorId)
                .orElseThrow(() -> new RuntimeException("No current consultation to complete."));
        current.setStatus(QueueStatus.COMPLETED);
        return queueRepository.save(current);
    }

    public StartQueueResult startQueueForDoctor(Long doctorId) {
        if (doctorId == null) {
            throw new RuntimeException("Doctor ID cannot be null");
        }

        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        String role = doctor.getRole() == null ? "" : doctor.getRole().toUpperCase();
        if (!"DOCTOR".equals(role) && !"STAFF".equals(role)) {
            throw new RuntimeException("Selected user is not a doctor");
        }

        List<Counter> doctorCounters = counterRepository.findByStaffId(doctorId);
        if (doctorCounters.isEmpty()) {
            throw new RuntimeException("No counter assigned to this doctor.");
        }

        int openedCounters = 0;
        for (Counter counter : doctorCounters) {
            if (counter.getStatus() != CounterStatus.OPEN) {
                counter.setStatus(CounterStatus.OPEN);
                counterRepository.save(counter);
                openedCounters++;
            }
        }

        List<QueueToken> waitingTokens = queueRepository.findByCounterStaffIdAndStatusOrderByIdAsc(doctorId, QueueStatus.WAITING);
        java.util.Set<Long> notifiedUsers = new java.util.HashSet<>();
        for (QueueToken token : waitingTokens) {
            if (token.getUser() == null || token.getUser().getId() == null) {
                continue;
            }
            Long userId = token.getUser().getId();
            if (notifiedUsers.add(userId)) {
                emailService.sendDoctorQueueStarted(token.getUser(), doctor, token.getCounter(), token);
            }
        }

        return new StartQueueResult(openedCounters, notifiedUsers.size());
    }
}
