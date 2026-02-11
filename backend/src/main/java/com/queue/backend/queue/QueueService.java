package com.queue.backend.queue;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class QueueService {

    private final QueueRepository queueRepository;

    public QueueService(QueueRepository queueRepository) {
        this.queueRepository = queueRepository;
    }

    // Generate new token
    public QueueToken generateToken(Long userId) {

        long waitingCount = queueRepository.countByStatus(QueueStatus.WAITING);
        int nextToken = (int) waitingCount + 1;

        QueueToken token = new QueueToken(
                nextToken,
                QueueStatus.WAITING,
                userId
        );

        return queueRepository.save(token);
    }

    // Get waiting queue
    public List<QueueToken> getWaitingQueue() {
        return queueRepository.findByStatusOrderByTokenNumberAsc(QueueStatus.WAITING);
    }

    // Serve next token
    public QueueToken serveNext() {

        List<QueueToken> waitingList =
                queueRepository.findByStatusOrderByTokenNumberAsc(QueueStatus.WAITING);

        if (waitingList.isEmpty()) {
            return null;
        }

        QueueToken token = waitingList.get(0);
        token.setStatus(QueueStatus.SERVED);

        return queueRepository.save(token);
    }
}

