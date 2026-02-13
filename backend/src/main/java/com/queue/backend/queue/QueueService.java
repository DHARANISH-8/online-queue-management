package com.queue.backend.queue;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import com.queue.backend.user.entity.User;
import com.queue.backend.user.repository.UserRepository;

@Service
public class QueueService {

    private final QueueRepository queueRepository;
    private final UserRepository userRepository;

    public QueueService(QueueRepository queueRepository,
            UserRepository userRepository) {
        this.queueRepository = queueRepository;
        this.userRepository = userRepository;
    }

    // ✅ Generate Token (AUTO INCREMENT SAFE)
    public QueueToken generateToken(Long userId, String serviceType) {

        if (userId == null) {
            throw new RuntimeException("User ID cannot be null");
        }

        // Fetch user from DB
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get last token
        Optional<QueueToken> lastTokenOpt = queueRepository.findFirstByOrderByTokenNumberDesc();

        int nextToken = lastTokenOpt.isPresent() ? lastTokenOpt.get().getTokenNumber() + 1 : 1;

        QueueToken token = new QueueToken(
                nextToken,
                QueueStatus.WAITING,
                user,
                serviceType);
        // Note: For now, we'll store serviceType in logs or metadata if needed,
        // but the token is simply queued for the next available counter.
        // We could also filter waiting queue by serviceType if we add that field to
        // QueueToken.

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
